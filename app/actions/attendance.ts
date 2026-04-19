'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';
import type { ActionResponse, Student, Attendance } from '@/types';

export async function getAttendanceByDateAndClass(date: string, classId: string): Promise<Attendance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attendances')
    .select('*, student:students(id, nis, full_name)')
    .eq('date', date)
    .eq('class_id', classId)
    .order('student(full_name)', { ascending: true });

  if (error) return [];
  return (data as unknown as Attendance[]) ?? [];
}

export async function getStudentsByClass(classId: string): Promise<Student[]> {
  const supabase = await createClient();
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('student:students(id, nis, full_name, gender)')
    .eq('class_id', classId)
    .eq('status', 'aktif');

  return (enrollments?.map((e: { student: unknown }) => e.student).filter(Boolean) ?? []) as unknown as Student[];
}

export async function saveAttendance(
  classId: string,
  date: string,
  records: { student_id: string; status: string; notes?: string }[]
): Promise<ActionResponse> {
  const profile = await getCurrentUser();
  if (!profile) return { success: false, message: 'Unauthorized' };

  const supabase = await createClient();

  // Delete existing attendance for this date/class first
  await supabase
    .from('attendances')
    .delete()
    .eq('class_id', classId)
    .eq('date', date);

  // Insert new records
  const toInsert = records.map((r) => ({
    student_id: r.student_id,
    class_id: classId,
    date,
    status: r.status,
    notes: r.notes || null,
    recorded_by: profile.id,
  }));

  const { error } = await supabase.from('attendances').insert(toInsert);

  if (error) {
    return { success: false, message: `Gagal menyimpan absensi: ${error.message}` };
  }

  revalidatePath('/absensi');
  return { success: true, message: 'Absensi berhasil disimpan' };
}

export async function getAttendanceRecap(
  classId: string, 
  startDate: string, 
  endDate: string
): Promise<Attendance[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('attendances')
    .select('*, student:students(id, full_name, nis)')
    .eq('class_id', classId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  return (data as unknown as Attendance[]) ?? [];
}
