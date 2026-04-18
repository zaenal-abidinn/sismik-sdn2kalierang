import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Absensi Siswa | Sistem Akademik SD N 2 Kalierang',
};
import { AttendanceForm } from './_components/attendance-form';
import { getClasses } from '@/app/actions/teachers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

export default async function AbsensiPage() {
  const classes = await getClasses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Siswa"
        description="Input dan kelola kehadiran harian siswa"
        action={
          <Button variant="outline" render={<Link href="/absensi/rekap" />}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Rekap Absensi
          </Button>
        }
      />

      <AttendanceForm
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
