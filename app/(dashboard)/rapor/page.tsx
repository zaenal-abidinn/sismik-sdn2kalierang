import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Rapor Siswa | Sistem Akademik SD N 2 Kalierang',
};
import { RaporView } from './_components/rapor-view';
import { getSemesters, getClasses } from '@/app/actions/teachers';

export default async function RaporPage() {
  const semesters = await getSemesters();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapor Siswa"
        description="Kelola dan cetak rapor siswa per semester"
      />
      <RaporView
        semesters={semesters.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
