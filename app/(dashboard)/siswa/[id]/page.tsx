import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStudentById } from '@/app/actions/students';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil, User, Phone, MapPin, BookOpen } from 'lucide-react';
import { GENDER_LABELS } from '@/types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { RaporGenerator } from './_components/rapor-generator';
import { getSemesters } from '@/app/actions/teachers';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const semesters = await getSemesters();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user?.id).single();
  const canGenerate = ['superadmin', 'kepala_sekolah', 'guru'].includes(profile?.role || '');

  const statusColors: Record<string, string> = {
    aktif: 'bg-emerald-100 text-emerald-700',
    pindah: 'bg-amber-100 text-amber-700',
    lulus: 'bg-blue-100 text-blue-700',
    keluar: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.full_name}
        description={`NIS: ${student.nis}`}
        action={
          <Button variant="outline" render={<Link href={`/siswa/${student.id}/edit`} />}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Data
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Pribadi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Data Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">NIS</p>
                <p className="font-mono font-medium">{student.nis}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className={statusColors[student.status]}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Nama Lengkap</p>
                <p className="font-medium">{student.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nama Panggilan</p>
                <p className="font-medium">{student.nickname || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">{GENDER_LABELS[student.gender]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Agama</p>
                <p className="font-medium">{student.religion}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tempat, Tanggal Lahir</p>
              <p className="font-medium">
                {student.birth_place},{' '}
                {format(new Date(student.birth_date), 'dd MMMM yyyy', { locale: idLocale })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Orang Tua & Alamat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Orang Tua & Alamat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Nama Orang Tua/Wali</p>
              <p className="font-medium">{student.parent_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">No. Telepon</p>
              <p className="font-medium">{student.parent_phone || '-'}</p>
            </div>
            <Separator />
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Alamat</p>
                <p className="font-medium">{student.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic History & Rapor */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Riwayat Akademik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground text-sm">
              Data riwayat akademik akan ditampilkan di sini
            </div>
          </CardContent>
        </Card>

        {canGenerate && (
          <RaporGenerator 
            studentId={student.id} 
            semesters={semesters.map(s => ({ id: s.id, name: s.name }))} 
          />
        )}
      </div>
    </div>
  );
}
