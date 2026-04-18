import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Siswa | Sistem Akademik SD N 2 Kalierang',
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StudentTable } from './_components/student-table';
import { getStudents } from '@/app/actions/students';

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function SiswaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { data: students, total } = await getStudents({
    search: params.search,
    status: params.status,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Siswa"
        description="Kelola data siswa SD N 2 Kalierang"
        action={
          <Button render={<Link href="/siswa/tambah" />}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Siswa
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Cari nama atau NIS..."
            defaultValue={params.search}
            className="pl-9"
          />
        </form>
      </div>

      <StudentTable students={students} total={total} />
    </div>
  );
}
