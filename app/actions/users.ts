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
