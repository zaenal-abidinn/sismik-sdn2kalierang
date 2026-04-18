'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveGrade, deleteGrade, getGradesByClassAndSubject } from '@/app/actions/grades';
import type { Student, Grade, GradeType } from '@/types';

interface GradeViewProps {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string; code: string }[];
  semesters: { id: string; name: string }[];
}

export function GradeView({ classes, subjects, semesters }: GradeViewProps) {
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [data, setData] = useState<{
    students: Student[];
    gradeTypes: GradeType[];
    grades: Grade[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    if (!classId || !subjectId || !semesterId) return;
    setLoading(true);
    try {
      const result = await getGradesByClassAndSubject(classId, subjectId, semesterId);
      setData(result);
    } catch {
      toast.error('Gagal memuat data nilai');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveGrade(formData: FormData) {
    setSaving(true);
    try {
      const result = await saveGrade(formData);
      if (result.success) {
        toast.success(result.message);
        setDialogOpen(false);
        loadData();
      } else {
        toast.error(result.message || 'Gagal menyimpan nilai');
      }
    } catch {
      toast.error('Gagal menyimpan nilai');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(gradeId: string) {
    const result = await deleteGrade(gradeId);
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="w-full sm:w-auto">
          <Label className="text-xs text-muted-foreground mb-1 block">Kelas</Label>
          <Select value={classId} onValueChange={(v) => v && setClassId(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Label className="text-xs text-muted-foreground mb-1 block">Mata Pelajaran</Label>
          <Select value={subjectId} onValueChange={(v) => v && setSubjectId(v)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Pilih Mapel" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Label className="text-xs text-muted-foreground mb-1 block">Semester</Label>
          <Select value={semesterId} onValueChange={(v) => v && setSemesterId(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Pilih Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={loadData} disabled={!classId || !subjectId || !semesterId || loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Tampilkan
        </Button>
      </div>

      {data && (
        <>
          <div className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button />}>
                  <Plus className="mr-2 h-4 w-4" />
                  Input Nilai
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Input Nilai Baru</DialogTitle>
                </DialogHeader>
                <form action={handleSaveGrade} className="space-y-4">
                  <input type="hidden" name="subject_id" value={subjectId} />
                  <input type="hidden" name="semester_id" value={semesterId} />
                  <div className="space-y-2">
                    <Label>Siswa</Label>
                    <Select name="student_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Siswa" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Penilaian</Label>
                    <Select name="grade_type_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.gradeTypes.map((gt) => (
                          <SelectItem key={gt.id} value={gt.id}>
                            {gt.name} ({gt.weight_percentage}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nilai (0-100)</Label>
                      <Input name="score" type="number" min="0" max="100" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal</Label>
                      <Input name="date_recorded" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Input name="notes" placeholder="Catatan opsional" />
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Simpan Nilai
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-center">Nilai</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.grades.length > 0 ? (
                    data.grades.map((g) => {
                      const student = data.students.find((s) => s.id === g.student_id);
                      return (
                        <TableRow key={g.id}>
                          <TableCell className="font-medium">{student?.full_name ?? '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{g.grade_type?.name ?? '-'}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${g.score >= 75 ? 'text-emerald-600' : g.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {g.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{g.date_recorded}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{g.notes || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(g.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada data nilai
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
