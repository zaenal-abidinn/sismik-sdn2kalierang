'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveAttendance, getStudentsByClass, getAttendanceByDateAndClass } from '@/app/actions/attendance';
import type { AttendanceStatus, Student, Attendance } from '@/types';

interface AttendanceFormProps {
  classes: { id: string; name: string }[];
}

interface StudentAttendance {
  student_id: string;
  nis: string;
  full_name: string;
  status: AttendanceStatus;
  notes: string;
}

const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'hadir', label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200' },
  { value: 'sakit', label: 'Sakit', color: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' },
  { value: 'izin', label: 'Izin', color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' },
  { value: 'alpha', label: 'Alpha', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
];

export function AttendanceForm({ classes }: AttendanceFormProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const [studentList, existingAttendance] = await Promise.all([
        getStudentsByClass(selectedClass),
        getAttendanceByDateAndClass(selectedDate, selectedClass),
      ]);

      const mapped: StudentAttendance[] = (studentList as Student[]).map((s) => {
        const existing = (existingAttendance as Attendance[]).find(
          (a) => a.student_id === s.id
        );
        return {
          student_id: s.id,
          nis: s.nis,
          full_name: s.full_name,
          status: existing?.status ?? 'hadir',
          notes: existing?.notes ?? '',
        };
      });

      setStudents(mapped);
    } catch {
      toast.error('Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      const timer = setTimeout(() => loadStudents(), 0);
      return () => clearTimeout(timer);
    }
  }, [selectedClass, selectedDate, loadStudents]);

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId ? { ...s, status } : s
      )
    );
  }

  function updateNotes(studentId: string, notes: string) {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId ? { ...s, notes } : s
      )
    );
  }

  function setAllStatus(status: AttendanceStatus) {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  }

  async function handleSave() {
    if (!selectedClass || !selectedDate || students.length === 0) return;
    setSaving(true);
    try {
      const result = await saveAttendance(
        selectedClass,
        selectedDate,
        students.map((s) => ({
          student_id: s.student_id,
          status: s.status,
          notes: s.notes || undefined,
        }))
      );
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Gagal menyimpan absensi');
    } finally {
      setSaving(false);
    }
  }

  const summary = {
    hadir: students.filter((s) => s.status === 'hadir').length,
    sakit: students.filter((s) => s.status === 'sakit').length,
    izin: students.filter((s) => s.status === 'izin').length,
    alpha: students.filter((s) => s.status === 'alpha').length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedClass} onValueChange={(v) => v && setSelectedClass(v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Pilih Kelas" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-[180px]"
        />
      </div>

      {students.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-600">{summary.hadir}</p>
              <p className="text-xs text-emerald-600/70">Hadir</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-600">{summary.sakit}</p>
              <p className="text-xs text-amber-600/70">Sakit</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-2xl font-bold text-blue-600">{summary.izin}</p>
              <p className="text-xs text-blue-600/70">Izin</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-2xl font-bold text-red-600">{summary.alpha}</p>
              <p className="text-xs text-red-600/70">Alpha</p>
            </div>
          </div>

          {/* Quick set all */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Set semua:</span>
            {statusOptions.map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                onClick={() => setAllStatus(opt.value)}
                className="text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Student list */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {students.map((student, idx) => (
                  <div
                    key={student.student_id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground w-8">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{student.nis}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-1.5">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateStatus(student.student_id, opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            student.status === opt.value
                              ? opt.color + ' ring-2 ring-offset-1 ring-current/20'
                              : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <Input
                      placeholder="Keterangan"
                      value={student.notes}
                      onChange={(e) => updateNotes(student.student_id, e.target.value)}
                      className="sm:w-40 text-sm h-8"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Absensi
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Memuat data siswa...
        </div>
      )}

      {!selectedClass && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm">Pilih kelas dan tanggal untuk memulai absensi</p>
        </div>
      )}
    </div>
  );
}
