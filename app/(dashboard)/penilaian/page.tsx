import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Penilaian Siswa | Sistem Akademik SD N 2 Kalierang',
};
import { GradeView } from './_components/grade-view';
import { getClasses, getSubjects, getSemesters } from '@/app/actions/teachers';

export default async function PenilaianPage() {
  const [classes, subjects, semesters] = await Promise.all([
    getClasses(),
    getSubjects(),
    getSemesters(),
  ]);

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
