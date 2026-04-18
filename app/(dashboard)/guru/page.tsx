import { PageHeader } from '@/components/shared/page-header';
import { getTeachers, getSubjects } from '@/app/actions/teachers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_LABELS } from '@/types';
import { GraduationCap, BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default async function GuruPage() {
  const [teachers, subjects] = await Promise.all([getTeachers(), getSubjects()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guru & Mata Pelajaran"
        description="Kelola data guru dan mata pelajaran"
      />

      <Tabs defaultValue="guru">
        <TabsList>
          <TabsTrigger value="guru">
            <GraduationCap className="mr-2 h-4 w-4" />
            Guru ({teachers.length})
          </TabsTrigger>
          <TabsTrigger value="mapel">
            <BookOpen className="mr-2 h-4 w-4" />
            Mata Pelajaran ({subjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guru" className="mt-6">
          {teachers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => {
                const initials = teacher.full_name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-4 p-5">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{teacher.full_name}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {ROLE_LABELS[teacher.role]}
                        </Badge>
                        {teacher.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{teacher.phone}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="Belum ada data guru"
              description="Data guru akan muncul setelah akun guru dibuat di manajemen pengguna."
            />
          )}
        </TabsContent>

        <TabsContent value="mapel" className="mt-6">
          {subjects.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Mata Pelajaran</TableHead>
                      <TableHead>Kelas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject, i) => (
                      <TableRow key={subject.id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{subject.code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>Kelas {subject.grade_level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Belum ada mata pelajaran"
              description="Tambahkan mata pelajaran untuk memulai pengelolaan kurikulum."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
