import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';
import { PageHeader } from '@/components/shared/page-header';
import { ProfileForm } from '../_components/profile-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Calendar, Shield } from 'lucide-react';
import { ROLE_LABELS } from '@/types';

export const metadata: Metadata = {
  title: 'Profil Pengguna | Sistem Akademik SD N 2 Kalierang',
};

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  // Jika userId adalah diri sendiri, redirect ke /profil
  if (userId === currentUser.user_id) {
    redirect('/profil');
  }

  // Hanya admin, kepala sekolah, tata usaha boleh lihat profil orang lain
  const allowedRoles = ['superadmin', 'kepala_sekolah', 'tata_usaha'];
  if (!allowedRoles.includes(currentUser.role)) {
    redirect('/profil');
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) notFound();

  const initials = profile.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleColors: Record<string, string> = {
    superadmin: 'bg-red-100 text-red-700',
    kepala_sekolah: 'bg-purple-100 text-purple-700',
    guru: 'bg-blue-100 text-blue-700',
    tata_usaha: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Pengguna"
        description={`Detail akun ${profile.full_name}`}
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Nama */}
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="h-24 w-24 border-2 border-slate-100 ring-2 ring-slate-50">
                {profile.photo_url && (
                  <AvatarImage src={profile.photo_url} alt={profile.full_name} className="object-cover" />
                )}
                <AvatarFallback className="bg-red-50 text-[#8B0000] text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-lg">{profile.full_name}</p>
                <Badge className={`mt-1 ${roleColors[profile.role]}`} variant="secondary">
                  {ROLE_LABELS[profile.role]}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Detail */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Nama Lengkap</p>
                  <p className="font-medium">{profile.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">No. Telepon</p>
                  <p className="font-medium">{profile.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Role</p>
                  <p className="font-medium">{ROLE_LABELS[profile.role]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Terdaftar sejak</p>
                  <p className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
