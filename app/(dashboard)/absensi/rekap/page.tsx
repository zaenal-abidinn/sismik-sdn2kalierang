import { PageHeader } from '@/components/shared/page-header';
import { RecapView } from './_components/recap-view';
import { getClasses } from '@/app/actions/teachers';

export default async function RekapAbsensiPage() {
  const classes = await getClasses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Absensi"
        description="Rekap kehadiran bulanan per kelas"
      />
      <RecapView classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
