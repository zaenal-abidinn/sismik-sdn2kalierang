'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { subjectSchema } from '@/lib/validations/schemas';
import type { ActionResponse } from '@/types';

export async function getTeachers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'guru')
    .order('full_name');
  return data ?? [];
}

export async function getSubjects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subjects')
    .select('*')
    .order('grade_level')
    .order('name');
  return data ?? [];
}

export async function createSubject(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    grade_level: Number(formData.get('grade_level')),
  };

  const validated = subjectSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('subjects').insert([validated.data]);

  if (error) {
    return { success: false, message: `Gagal menambah mapel: ${error.message}` };
  }

  revalidatePath('/guru');
  return { success: true, message: 'Mata pelajaran berhasil ditambahkan' };
}

export async function deleteSubject(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from('subjects').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Gagal menghapus mapel: ${error.message}` };
  }

  revalidatePath('/guru');
  return { success: true, message: 'Mata pelajaran berhasil dihapus' };
}

export async function getClasses() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('classes')
    .select('*, homeroom_teacher:profiles(id, full_name)')
    .order('grade_level')
    .order('name');
  return data ?? [];
}

export async function getSchoolYears() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('school_years')
    .select('*')
    .order('start_date', { ascending: false });
  return data ?? [];
}

export async function getSemesters(schoolYearId?: string) {
  const supabase = await createClient();
  let query = supabase.from('semesters').select('*').order('semester_number');
  if (schoolYearId) {
    query = query.eq('school_year_id', schoolYearId);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getTeacherSubjects(teacherId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('teacher_subjects')
    .select('*, teacher:profiles(id, full_name), subject:subjects(id, name, code), class:classes(id, name)');

  if (teacherId) {
    query = query.eq('teacher_id', teacherId);
  }

  const { data } = await query;
  return data ?? [];
}
