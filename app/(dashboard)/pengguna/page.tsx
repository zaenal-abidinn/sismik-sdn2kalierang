import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Manajemen Pengguna | Sistem Akademik SD N 2 Kalierang',
};
import { UserList } from './_components/user-list';
import { getUsers } from '@/app/actions/users';

export default async function PenggunaPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun pengguna sistem akademik"
      />
      <UserList users={users} />
    </div>
  );
}
