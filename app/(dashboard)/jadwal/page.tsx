import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClasses } from '@/app/actions/teachers';
import { EmptyState } from '@/components/shared/empty-state';
import { Calendar } from 'lucide-react';
import type { Class } from '@/types';

export default async function JadwalPage() {
  const classes = await getClasses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Pelajaran"
        description="Kelola jadwal pelajaran per kelas"
      />

      {classes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
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
