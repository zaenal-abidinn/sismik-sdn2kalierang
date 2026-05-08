import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';
import { UserList } from './_components/user-list';
import { getUsers } from '@/app/actions/users';
import { getCurrentUser } from '@/app/actions/auth';

export const metadata: Metadata = {
  title: 'Manajemen Pengguna | Sistem Akademik SD N 2 Kalierang',
};

export default async function PenggunaPage() {
  const [users, currentUser] = await Promise.all([getUsers(), getCurrentUser()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun pengguna sistem akademik"
      />
      <UserList users={users} currentUserRole={currentUser?.role ?? ''} />
    </div>
  );
}
