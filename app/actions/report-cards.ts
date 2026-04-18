'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types';

export async function generateReportCard(
  studentId: string,
  semesterId: string,
  homeeroomNotes?: string
): Promise<ActionResponse> {
  interface GradeQueryResult {
    score: number;
    subject: { id: string; name: string } | null;
    grade_type: { weight_percentage: number } | null;
  }
  
  const supabase = await createClient();

  // Get all grades for this student and semester
  const { data: grades } = await supabase
    .from('grades')
    .select('score, subject:subjects(id, name), grade_type:grade_types(weight_percentage)')
    .eq('student_id', studentId)
    .eq('semester_id', semesterId) as { data: GradeQueryResult[] | null };

  if (!grades || grades.length === 0) {
    return { success: false, message: 'Tidak ada data nilai untuk siswa ini' };
  }

  // Calculate weighted final scores per subject
  const subjectScores = new Map<string, { name: string; totalWeighted: number; totalWeight: number }>();

  for (const grade of grades) {
    const subjectId = grade.subject?.id;
    const subjectName = grade.subject?.name ?? 'Unknown';
    const weight = grade.grade_type?.weight_percentage ?? 0;

    if (!subjectId) continue;

    if (!subjectScores.has(subjectId)) {
      subjectScores.set(subjectId, { name: subjectName, totalWeighted: 0, totalWeight: 0 });
    }

    const entry = subjectScores.get(subjectId)!;
    entry.totalWeighted += grade.score * weight;
    entry.totalWeight += weight;
  }

  const finalGrades: Record<string, { subject_name: string; score: number; grade: string }> = {};
  for (const [subjectId, data] of subjectScores) {
    const score = data.totalWeight > 0 ? Math.round(data.totalWeighted / data.totalWeight) : 0;
    let gradeStr = 'D';
    if (score >= 90) gradeStr = 'A';
    else if (score >= 80) gradeStr = 'B';
    else if (score >= 70) gradeStr = 'C';

    finalGrades[subjectId] = { subject_name: data.name, score, grade: gradeStr };
  }

  // Get attendance summary
  const { data: attendances } = await supabase
    .from('attendances')
    .select('status')
    .eq('student_id', studentId);

  const attendanceSummary = {
    hadir: attendances?.filter((a) => a.status === 'hadir').length ?? 0,
    sakit: attendances?.filter((a) => a.status === 'sakit').length ?? 0,
    izin: attendances?.filter((a) => a.status === 'izin').length ?? 0,
    alpha: attendances?.filter((a) => a.status === 'alpha').length ?? 0,
  };

  // Upsert report card
  const { error } = await supabase
    .from('report_cards')
    .upsert(
      {
        student_id: studentId,
        semester_id: semesterId,
        final_grades: finalGrades,
        attendance_summary: attendanceSummary,
        homeroom_notes: homeeroomNotes || null,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,semester_id' }
    );

  if (error) {
    return { success: false, message: `Gagal membuat rapor: ${error.message}` };
  }

  revalidatePath('/rapor');
  return { success: true, message: 'Rapor berhasil dibuat' };
}

export async function getReportCards(semesterId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('report_cards')
    .select('*, student:students(id, nis, full_name), semester:semesters(id, name)')
    .order('generated_at', { ascending: false });

  if (semesterId) {
    query = query.eq('semester_id', semesterId);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getReportCardByStudentAndSemester(studentId: string, semesterId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('report_cards')
    .select('*, student:students(*), semester:semesters(*, school_year:school_years(*))')
    .eq('student_id', studentId)
    .eq('semester_id', semesterId)
    .single();

  return data;
}
