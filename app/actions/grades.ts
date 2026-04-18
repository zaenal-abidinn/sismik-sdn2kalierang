'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';
import { gradeSchema } from '@/lib/validations/schemas';
import type { ActionResponse, Student, Grade, GradeType } from '@/types';

export async function getGradesByClassAndSubject(
  classId: string,
  subjectId: string,
  semesterId: string
): Promise<{ students: Student[]; grades: Grade[]; gradeTypes: GradeType[] }> {
  const supabase = await createClient();

  // Get enrolled students
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('student:students(id, nis, full_name)')
    .eq('class_id', classId)
    .eq('status', 'aktif');

  const students = (enrollments?.map((e: { student: unknown }) => e.student).filter(Boolean) ?? []) as unknown as Student[];

  // Get grades
  const { data: grades } = await supabase
    .from('grades')
    .select('*, grade_type:grade_types(id, name, code, weight_percentage)')
    .eq('subject_id', subjectId)
    .eq('semester_id', semesterId);

  // Get grade types
  const { data: gradeTypes } = await supabase
    .from('grade_types')
    .select('*')
    .order('code');

  return { students, grades: (grades as unknown as Grade[]) ?? [], gradeTypes: (gradeTypes as unknown as GradeType[]) ?? [] };
}

export async function saveGrade(formData: FormData): Promise<ActionResponse> {
  const profile = await getCurrentUser();
  if (!profile) return { success: false, message: 'Unauthorized' };

  const rawData = {
    student_id: formData.get('student_id') as string,
    subject_id: formData.get('subject_id') as string,
    semester_id: formData.get('semester_id') as string,
    grade_type_id: formData.get('grade_type_id') as string,
    score: Number(formData.get('score')),
    date_recorded: formData.get('date_recorded') as string,
    notes: (formData.get('notes') as string) || undefined,
  };

  const validated = gradeSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Data tidak valid',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('grades').insert([
    {
      ...validated.data,
      teacher_id: profile.id,
    },
  ]);

  if (error) {
    return { success: false, message: `Gagal menyimpan nilai: ${error.message}` };
  }

  revalidatePath('/penilaian');
  return { success: true, message: 'Nilai berhasil disimpan' };
}

export async function deleteGrade(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from('grades').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Gagal menghapus nilai: ${error.message}` };
  }

  revalidatePath('/penilaian');
  return { success: true, message: 'Nilai berhasil dihapus' };
}

export async function calculateFinalScore(
  studentId: string,
  subjectId: string,
  semesterId: string
) {
  interface GradeWeightResult {
    score: number;
    grade_type: { weight_percentage: number } | null;
  }

  const supabase = await createClient();
  const { data: grades } = await supabase
    .from('grades')
    .select('score, grade_type:grade_types(weight_percentage)')
    .eq('student_id', studentId)
    .eq('subject_id', subjectId)
    .eq('semester_id', semesterId) as { data: GradeWeightResult[] | null };

  if (!grades || grades.length === 0) return null;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const grade of grades) {
    const weight = grade.grade_type?.weight_percentage ?? 0;
    weightedSum += grade.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
}
