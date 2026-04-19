import { PageHeader } from '@/components/shared/page-header';
import { StudentForm } from '../_components/student-form';
import { getClasses } from '@/app/actions/teachers';

export default async function TambahSiswaPage() {
  const classes = await getClasses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Siswa Baru"
        description="Isi data lengkap siswa yang akan didaftarkan"
      />
      <StudentForm classes={classes} />
    </div>
  );
}
