import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSchedules } from '@/app/actions/schedules';
import { getSubjects, getTeachers, getSemesters } from '@/app/actions/teachers';
import { ScheduleForm } from '../_components/schedule-form';
import { PageHeader } from '@/components/shared/page-header';

interface PageProps {
  params: Promise<{ classId: string }>;
}

export default async function ClassSchedulePage({ params }: PageProps) {
  const { classId } = await params;
  const supabase = await createClient();

  // Get class details
  const { data: classData } = await supabase
    .from('classes')
    .select('*, profiles!classes_homeroom_teacher_id_fkey(full_name)')
    .eq('id', classId)
    .single();

  if (!classData) {
    notFound();
  }

  // Get active school year (fallback to latest if none active)
  let { data: schoolYear } = await supabase
    .from('school_years')
    .select('id, name')
    .eq('is_active', true)
    .single();

  if (!schoolYear) {
    const { data: latestYear } = await supabase
      .from('school_years')
      .select('id, name')
      .order('start_date', { ascending: false })
      .limit(1)
      .single();
    
    schoolYear = latestYear;
  }

  if (!schoolYear) {
    return (
        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
            <h2 className="text-xl font-semibold text-[#8B0000]">Data Tahun Ajaran Tidak Ditemukan</h2>
            <p className="text-sm text-slate-600 mt-2">Pastikan data tahun ajaran sudah diinput di database.</p>
        </div>
    );
  }

  const semesters = await getSemesters(schoolYear.id);
  const activeSemester = semesters[0]; // Take first as default if not found

  if (!activeSemester) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold">Semester belum ditentukan.</h2>
        </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  const isHomeroomTeacher = profile?.id === classData.homeroom_teacher_id;
  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'kepala_sekolah';

  // Fetch all assignments for this class to know which subjects are valid
  const { data: classAssignments } = await supabase
    .from('teacher_subjects')
    .select('subject_id, teacher_id')
    .eq('class_id', classId);

  const validSubjectIds = classAssignments?.map(a => a.subject_id) || [];
  
  let subjects = await getSubjects();
  let teachers = await getTeachers();

  // 1. Filter subjects to only those assigned to THIS class by Admin
  subjects = subjects.filter(s => validSubjectIds.includes(s.id));

  // 2. If regular teacher (not admin/not homeroom), further restrict to ONLY their subjects
  if (profile?.role === 'guru' && !isHomeroomTeacher && !isAdmin) {
    const mySubjectIds = classAssignments
      ?.filter(a => a.teacher_id === profile.id)
      .map(a => a.subject_id) || [];
    
    subjects = subjects.filter(s => mySubjectIds.includes(s.id));
    teachers = teachers.filter(t => t.id === profile.id);
  }

  const initialSchedules = await getSchedules(classId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Jadwal Pelajaran ${classData.name}`}
        description={`Kelola jadwal pelajaran untuk Kelas ${classData.grade_level}${isHomeroomTeacher ? ' (Anda adalah Wali Kelas)' : ''}`}
        className="print:hidden"
      />
      <ScheduleForm
        classId={classId}
        className={classData.name}
        semesterId={activeSemester.id}
        subjects={subjects}
        teachers={teachers}
        initialSchedules={initialSchedules}
      />
    </div>
  );
}
