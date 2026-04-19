import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';
import { getAnnouncements } from '@/app/actions/announcements';
import { createClient } from '@/lib/supabase/server';
import { AnnouncementList } from './_components/announcement-list';
import { AnnouncementFormWrapper } from './_components/announcement-form-wrapper';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pengumuman | Sistem Akademik SD N 2 Kalierang',
};

export default async function PengumumanPage() {
  const announcements = await getAnnouncements();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user?.id)
    .single();

  const canManage = ['superadmin', 'kepala_sekolah', 'tata_usaha'].includes(profile?.role || '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengumuman"
        description="Informasi dan berita terbaru seputar akademik sekolah."
        action={canManage && <AnnouncementFormWrapper />}
      />

      <div className="max-w-4xl mx-auto">
        <AnnouncementList 
          announcements={announcements} 
          canManage={canManage} 
        />
      </div>
    </div>
  );
}
