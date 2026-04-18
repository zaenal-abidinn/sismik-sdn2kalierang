import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profil Saya | Sistem Akademik SD N 2 Kalierang',
};
import { getCurrentUser } from '@/app/actions/auth';
import { PageHeader } from '@/components/shared/page-header';
import { ProfileForm } from './_components/profile-form';

export default async function ProfilPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect('/login');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun Anda"
      />
      <ProfileForm profile={profile} />
    </div>
  );
}
