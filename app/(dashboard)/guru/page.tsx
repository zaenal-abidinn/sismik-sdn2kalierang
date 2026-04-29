import { PageHeader } from '@/components/shared/page-header';
import { getTeachers, getSubjects, getClasses, getSemesters, getTeacherSubjects, deleteSubject } from '@/app/actions/teachers';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PrintButton } from '@/components/shared/print-button';
import { ROLE_LABELS } from '@/types';
import { GraduationCap, BookOpen, Plus, Trash2, Settings2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { SubjectFormWrapper } from './_components/subject-form-wrapper';
import { AssignmentManager } from './_components/assignment-manager';
import { createClient } from '@/lib/supabase/server';
import { TeacherEditForm } from './_components/teacher-edit-form';

export default async function GuruPage() {
  const [teachers, subjects, classes, semesters, assignments] = await Promise.all([
    getTeachers(), 
    getSubjects(),
    getClasses(),
    getSemesters(),
    getTeacherSubjects()
  ]);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user?.id).single();
  const canManageTeachers = ['superadmin', 'kepala_sekolah', 'tata_usaha'].includes(profile?.role || '');
  const canManageAcademic = ['superadmin', 'kepala_sekolah'].includes(profile?.role || '');

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Guru & Mata Pelajaran"
        description="Kelola data guru, mata pelajaran, dan penugasan wali kelas."
        action={
          <div className="flex gap-2 print:hidden">
            <PrintButton />
          </div>
        }
      />

      <Tabs defaultValue="guru" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100 p-1">
          <TabsTrigger value="guru">
            <GraduationCap className="mr-2 h-4 w-4" />
            Guru
          </TabsTrigger>
          <TabsTrigger value="mapel">
            <BookOpen className="mr-2 h-4 w-4" />
            Mapel
          </TabsTrigger>
          <TabsTrigger value="penugasan">
            <Settings2 className="mr-2 h-4 w-4" />
            Penugasan
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
                  <Card key={teacher.id} className="hover:shadow-md transition-all duration-200 border-slate-100 group relative">
                    <CardContent className="flex items-center gap-4 p-5">
                      <Avatar className="h-12 w-12 border-2 border-white ring-2 ring-red-50">
                        <AvatarImage src={teacher.photo_url} className="object-cover" />
                        <AvatarFallback className="bg-red-50 text-[#8B0000] font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold truncate text-slate-900">{teacher.full_name}</p>
                        <Badge variant="secondary" className="text-[10px] mt-1 bg-red-50 text-[#8B0000] hover:bg-red-100 border-0">
                          {ROLE_LABELS[teacher.role]}
                        </Badge>
                        {teacher.phone && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-medium">{teacher.phone}</p>
                        )}
                      </div>
                      {canManageTeachers && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TeacherEditForm teacher={teacher} />
                        </div>
                      )}
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
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Daftar Mata Pelajaran</h3>
              <p className="text-sm text-muted-foreground">Kelola kurikulum mata pelajaran per kelas.</p>
            </div>
            {canManageAcademic && <SubjectFormWrapper />}
          </div>

          {subjects.length > 0 ? (
            <Card className="border-slate-100 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-12 text-center">No</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Mata Pelajaran</TableHead>
                      <TableHead>Level Kelas</TableHead>
                      <TableHead className="w-24 text-center print:hidden">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject, i) => (
                      <TableRow key={subject.id}>
                        <TableCell className="text-center text-muted-foreground font-medium text-xs">{i + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs border-slate-200 bg-white">{subject.code}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">{subject.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0">
                            Kelas {subject.grade_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center print:hidden">
                          <div className="flex justify-center gap-1">
                            {canManageAcademic ? (
                              <>
                                <SubjectFormWrapper subject={subject} mode="edit" />
                                <form action={async () => {
                                  'use server';
                                  await deleteSubject(subject.id);
                                }}>
                                  <Button 
                                    type="submit" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </form>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
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

        <TabsContent value="penugasan" className="mt-6">
          <AssignmentManager 
            teachers={teachers}
            subjects={subjects}
            classes={classes}
            semesters={semesters}
            assignments={assignments}
            canManage={canManageAcademic}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
