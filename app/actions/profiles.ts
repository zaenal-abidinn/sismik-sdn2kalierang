'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from '@/types';

export async function updateProfile(
  id: string,
  data: { full_name?: string; phone?: string; photo_url?: string }
): Promise<ActionResponse> {
  const supabase = await createClient();
  
  // 1. Authorization check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Unauthorized' };

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('user_id', user.id)
    .single();

  if (!currentProfile) return { success: false, message: 'Profile not found' };

  // Strict check: Guru cannot edit profile (even their own)
  if (currentProfile.role === 'guru') {
    return { success: false, message: 'Guru tidak memiliki izin untuk mengubah profil. Hubungi Tata Usaha.' };
  }

  const canManage = ['superadmin', 'kepala_sekolah', 'tata_usaha'].includes(currentProfile.role);

  if (!canManage) {
    return { success: false, message: 'Anda tidak memiliki izin untuk mengubah profil ini' };
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', id);

  if (error) {
    return { success: false, message: `Gagal memperbarui profil: ${error.message}` };
  }

  revalidatePath('/profil');
  revalidatePath('/guru');
  return { success: true, message: 'Profil berhasil diperbarui' };
}
