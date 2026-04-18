import { PageHeader } from '@/components/shared/page-header';
import { StudentForm } from '../_components/student-form';

export default function TambahSiswaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Siswa Baru"
        description="Isi data lengkap siswa yang akan didaftarkan"
      />
      <StudentForm />
    </div>
  );
}
