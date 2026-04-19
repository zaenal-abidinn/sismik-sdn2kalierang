import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClasses } from '@/app/actions/teachers';
import { EmptyState } from '@/components/shared/empty-state';
import { Calendar } from 'lucide-react';
import type { Class } from '@/types';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

export default async function JadwalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  let classes = await getClasses();

  if (profile?.role === 'guru') {
    // Get classes where they are homeroom teacher
    const homeroomClassIds = classes
      .filter(c => c.homeroom_teacher_id === profile.id)
      .map(c => c.id);

    // Get classes where they are subject teachers
    const { data: subjectAssignments } = await supabase
      .from('teacher_subjects')
      .select('class_id')
      .eq('teacher_id', profile.id);
    
    const subjectClassIds = subjectAssignments?.map(a => a.class_id) || [];
    
    const allowedClassIds = new Set([...homeroomClassIds, ...subjectClassIds]);
    classes = classes.filter(c => allowedClassIds.has(c.id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Pelajaran"
        description="Kelola jadwal pelajaran per kelas"
      />

      {classes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/jadwal/${cls.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Wali Kelas: {(cls as Class).homeroom_teacher?.full_name || 'Belum ditentukan'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Kelas {cls.grade_level}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="Belum ada jadwal"
          description="Tambahkan kelas terlebih dahulu untuk membuat jadwal pelajaran."
        />
      )}
    </div>
  );
}
