'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { userSchema } from '@/lib/validations/schemas';
import type { ActionResponse } from '@/types';

export async function getUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createUser(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    email: formData.get('email') as string,
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as string,
    password: formData.get('password') as string,
  };

  const validated = userSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.createUser({
    email: validated.data.email,
    password: validated.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: validated.data.full_name,
      role: validated.data.role,
    },
  });

  if (error) {
    return { success: false, message: `Gagal membuat akun: ${error.message}` };
  }

  revalidatePath('/pengguna');
  return { success: true, message: 'Akun pengguna berhasil dibuat' };
}

export async function updateUser(
  userId: string,
  data: { full_name?: string; role?: string; phone?: string }
): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Tidak terautentikasi' };

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const allowedRoles = ['superadmin', 'kepala_sekolah', 'tata_usaha'];
  if (!currentProfile || !allowedRoles.includes(currentProfile.role)) {
    return { success: false, message: 'Tidak memiliki izin' };
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', userId);

  if (error) {
    return { success: false, message: `Gagal memperbarui: ${error.message}` };
  }

  revalidatePath('/pengguna');
  return { success: true, message: 'Data pengguna berhasil diperbarui' };
}

export async function deleteUser(userId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Tidak terautentikasi' };

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!currentProfile || !['superadmin', 'kepala_sekolah'].includes(currentProfile.role)) {
    return { success: false, message: 'Hanya Admin/Kepala Sekolah yang dapat menghapus pengguna' };
  }

  if (userId === user.id) {
    return { success: false, message: 'Tidak dapat menghapus akun sendiri' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, message: `Gagal menghapus: ${error.message}` };
  }

  revalidatePath('/pengguna');
  return { success: true, message: 'Pengguna berhasil dihapus' };
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('user_id', userId);

  if (error) {
    return { success: false, message: `Gagal mengubah role: ${error.message}` };
  }

  revalidatePath('/pengguna');
  return { success: true, message: 'Role berhasil diperbarui' };
}
