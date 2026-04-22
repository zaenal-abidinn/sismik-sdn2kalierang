'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  updateHomeroomTeacher, 
  assignTeacherSubject, 
  removeTeacherSubject 
} from '@/app/actions/teachers';
import { toast } from 'sonner';
import { Users, BookOpen, Trash2, Plus, Loader2 } from 'lucide-react';

interface AssignmentManagerProps {
  teachers: any[];
  subjects: any[];
  classes: any[];
  semesters: any[];
  assignments: any[];
}

export function AssignmentManager({ 
  teachers, 
  subjects, 
  classes, 
  semesters, 
  assignments 
}: AssignmentManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  
  // Subject Assignment State
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const handleUpdateHomeroom = async (classId: string, teacherId: string) => {
    setLoading(`homeroom-${classId}`);
    const res = await updateHomeroomTeacher(classId, teacherId === 'none' ? null : teacherId);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setLoading(null);
  };

  const handleAddAssignment = async () => {
    if (!selectedTeacher || !selectedSubject || !selectedClass || !selectedSemester) {
      toast.error('Mohon lengkapi semua pilihan');
      return;
    }
    setLoading('add-assignment');
    const res = await assignTeacherSubject(selectedTeacher, selectedSubject, selectedClass, selectedSemester);
    if (res.success) {
      toast.success(res.message);
      setSelectedSubject(null);
    } else {
      toast.error(res.message);
    }
    setLoading(null);
  };

  const handleRemoveAssignment = async (id: string) => {
    if (!confirm('Hapus penugasan ini?')) return;
    setLoading(`remove-${id}`);
    const res = await removeTeacherSubject(id);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setLoading(null);
  };

  return (
    <div className="space-y-8">
      {/* Homeroom Teacher Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#8B0000]" />
            <CardTitle>Penentuan Wali Kelas</CardTitle>
          </div>
          <CardDescription>Tentukan satu wali kelas untuk setiap kelas yang aktif.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelas</TableHead>
                <TableHead>Wali Kelas Saat Ini</TableHead>
                <TableHead className="w-[300px]">Pilih Wali Kelas Baru</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-bold">Kelas {cls.name}</TableCell>
                  <TableCell>
                    {cls.homeroom_teacher ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                        {cls.homeroom_teacher.full_name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Belum ditentukan</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      key={cls.id + (cls.homeroom_teacher_id || 'none')}
                      value={cls.homeroom_teacher_id || 'none'}
                      onValueChange={(val) => handleUpdateHomeroom(cls.id, val || 'none')}
                      disabled={loading === `homeroom-${cls.id}`}
                    >
                      <SelectTrigger className="bg-white h-11 border-slate-200 focus:ring-red-100 transition-all">
                        <SelectValue placeholder="Pilih Guru" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="py-2.5 text-slate-500 italic">Kosongkan</SelectItem>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="py-2.5">
                            <span className="font-medium">{t.full_name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subject Assignment Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#8B0000]" />
            <CardTitle>Penugasan Guru Mata Pelajaran</CardTitle>
          </div>
          <CardDescription>Tentukan mata pelajaran apa saja yang diampu oleh setiap guru.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 bg-slate-50/50 p-6 rounded-2xl items-end border border-slate-100 shadow-sm">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Users className="h-3 w-3" /> Guru Pengampu
              </label>
              <Select value={selectedTeacher || ''} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="bg-white h-11 border-slate-200 focus:ring-red-100 transition-all">
                  <SelectValue placeholder="Pilih Guru" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id} className="py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{t.full_name}</span>
                        <span className="text-[10px] text-muted-foreground">ID: {t.id.slice(0, 8)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> Mata Pelajaran
              </label>
              <Select value={selectedSubject || ''} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white h-11 border-slate-200 focus:ring-red-100 transition-all">
                  <SelectValue placeholder="Pilih Mapel" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id} className="py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] h-3.5 px-1 font-mono uppercase border-slate-200">
                            {s.code}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground italic">Kelas {s.grade_level}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Users className="h-3 w-3" /> Target Kelas
              </label>
              <Select value={selectedClass || ''} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white h-11 border-slate-200 focus:ring-red-100 transition-all">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id} className="py-2.5">
                      <span className="font-medium text-slate-700">Kelas {c.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Loader2 className="h-3 w-3" /> Semester
              </label>
              <Select value={selectedSemester || ''} onValueChange={setSelectedSemester}>
                <SelectTrigger className="bg-white h-11 border-slate-200 focus:ring-red-100 transition-all">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(s => (
                    <SelectItem key={s.id} value={s.id} className="py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-[10px] text-muted-foreground">{s.school_years?.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddAssignment} 
              disabled={loading === 'add-assignment'}
              className="bg-[#8B0000] hover:bg-[#7c0000] h-11 shadow-lg shadow-red-900/20 w-full transition-all active:scale-[0.98]"
            >
              {loading === 'add-assignment' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Tugaskan
                </>
              )}
            </Button>
          </div>

          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Guru</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length > 0 ? (
                  assignments.map((asgn) => (
                    <TableRow key={asgn.id}>
                      <TableCell className="font-medium">{asgn.teacher?.full_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{asgn.subject?.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">{asgn.subject?.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>Kelas {asgn.class?.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{asgn.semester_id?.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveAssignment(asgn.id)}
                          disabled={loading === `remove-${asgn.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                      Belum ada penugasan guru mata pelajaran.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
