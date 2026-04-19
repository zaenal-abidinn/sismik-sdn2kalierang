'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from '@/types';

export async function getAnnouncements() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('announcements')
    .select('*, created_by:profiles(full_name)')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createAnnouncement(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, message: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || !['superadmin', 'kepala_sekolah', 'tata_usaha'].includes(profile.role)) {
    return { success: false, message: 'Hanya Admin, Kepsek, atau TU yang bisa membuat pengumuman' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const target_role = formData.get('target_role') as string;

  if (!title || !content) {
    return { success: false, message: 'Judul dan isi pengumuman harus diisi' };
  }

  const { error } = await supabase.from('announcements').insert([{
    title,
    content,
    target_role,
    created_by: profile.id
  }]);

  if (error) {
    return { success: false, message: `Gagal membuat pengumuman: ${error.message}` };
  }

  revalidatePath('/pengumuman');
  revalidatePath('/');
  return { success: true, message: 'Pengumuman berhasil diterbitkan' };
}

export async function deleteAnnouncement(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from('announcements').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Gagal menghapus pengumuman: ${error.message}` };
  }

  revalidatePath('/pengumuman');
  return { success: true, message: 'Pengumuman berhasil dihapus' };
}
