import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';
import { GradeView } from './_components/grade-view';

export const metadata: Metadata = {
  title: 'Penilaian Siswa | Sistem Akademik SD N 2 Kalierang',
};
import { getClasses, getSubjects, getSemesters, getTeacherSubjects } from '@/app/actions/teachers';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function PenilaianPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect('/login');

  const [classes, allSubjects, semesters, teacherAssignments] = await Promise.all([
    getClasses(),
    getSubjects(),
    getSemesters(),
    getTeacherSubjects(profile.role === 'guru' ? profile.id : undefined),
  ]);

  // Filter subjects based on assignments if teacher
  const subjects = profile.role === 'guru' 
    ? allSubjects.filter(s => teacherAssignments.some(asgn => asgn.subject_id === s.id))
    : allSubjects;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penilaian"
        description="Input dan kelola nilai siswa per mata pelajaran"
      />
      <GradeView
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
        semesters={semesters.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
