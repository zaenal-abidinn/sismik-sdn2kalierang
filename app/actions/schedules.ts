'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from '@/types';

export async function getSchedules(classId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('schedules')
    .select('*, subject:subjects(id, name, code), teacher:profiles(id, full_name)')
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time');
  return data ?? [];
}

export async function saveSchedule(
  classId: string,
  semesterId: string,
  schedules: any[]
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    // 1. Delete existing schedules for this class and semester
    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('class_id', classId)
      .eq('semester_id', semesterId);

    if (deleteError) {
      console.error('Delete Error:', deleteError);
      return { success: false, message: `Gagal membersihkan jadwal lama: ${deleteError.message}` };
    }

    if (!schedules || schedules.length === 0) {
      revalidatePath(`/jadwal/${classId}`);
      return { success: true, message: 'Jadwal berhasil dikosongkan' };
    }

    // 2. Prepare and validate data for insertion
    const dataToInsert = schedules.map(s => ({
      class_id: classId,
      semester_id: semesterId,
      subject_id: s.subject_id,
      teacher_id: s.teacher_id,
      day_of_week: Number(s.day_of_week),
      start_time: s.start_time,
      end_time: s.end_time
    }));

    // Simple validation check
    const isValid = dataToInsert.every(s => 
      s.subject_id && s.teacher_id && s.day_of_week && s.start_time && s.end_time
    );

    if (!isValid) {
      return { success: false, message: 'Data jadwal tidak lengkap. Pastikan semua kolom terisi.' };
    }

    // 3. Insert new schedules
    const { error: insertError } = await supabase
      .from('schedules')
      .insert(dataToInsert);

    if (insertError) {
      console.error('Insert Error:', insertError);
      return { success: false, message: `Gagal menyimpan jadwal: ${insertError.message}` };
    }

    revalidatePath(`/jadwal/${classId}`);
    return { success: true, message: 'Jadwal berhasil disimpan' };
  } catch (err: any) {
    console.error('Unexpected Error:', err);
    return { success: false, message: `Terjadi kesalahan sistem: ${err.message}` };
  }
}
