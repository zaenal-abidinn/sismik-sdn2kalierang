import { notFound } from 'next/navigation';
import { getStudentById } from '@/app/actions/students';
import { getClasses } from '@/app/actions/teachers';
import { PageHeader } from '@/components/shared/page-header';
import { StudentForm } from '../../_components/student-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: PageProps) {
  const { id } = await params;
  const student = await getStudentById(id);
  const classes = await getClasses();

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Data Siswa"
        description={`${student.full_name} — NIS: ${student.nis}`}
      />
      <StudentForm student={student} classes={classes} />
    </div>
  );
}
