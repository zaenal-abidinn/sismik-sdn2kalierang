'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Save, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { saveSchedule } from '@/app/actions/schedules';
import { DAYS_OF_WEEK } from '@/types';

interface ScheduleFormProps {
  classId: string;
  className: string;
  semesterId: string;
  subjects: any[];
  teachers: any[];
  initialSchedules: any[];
}

export function ScheduleForm({
  classId,
  className,
  semesterId,
  subjects,
  teachers,
  initialSchedules,
}: ScheduleFormProps) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () => {
    setSchedules([
      ...schedules,
      {
        day_of_week: 1,
        subject_id: '',
        teacher_id: '',
        start_time: '07:00',
        end_time: '08:00',
      },
    ]);
  };

  const removeRow = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSchedules(newSchedules);
  };

  const handleSave = async () => {
    // 1. Basic validation
    const hasEmpty = schedules.some(s => !s.subject_id || !s.teacher_id);
    if (hasEmpty) {
        toast.error('Mohon lengkapi semua baris jadwal sebelum menyimpan.');
        return;
    }

    // 2. Conflict detection (Overlapping time on same day)
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];

        if (s1.day_of_week === s2.day_of_week) {
          // Check overlap: (StartA < EndB) and (EndA > StartB)
          if (s1.start_time < s2.end_time && s1.end_time > s2.start_time) {
            toast.error(`Bentrok jadwal detected! Baris ${i + 1} dan ${j + 1} bertabrakan di hari yang sama.`);
            return;
          }
        }
      }
    }

    setIsSaving(true);
    try {
      const res = await saveSchedule(classId, semesterId, schedules);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Gagal menyimpan jadwal. Terjadi kesalahan koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group schedules by day for preview
  const groupedSchedules = DAYS_OF_WEEK.map(day => ({
    ...day,
    items: schedules
        .filter(s => String(s.day_of_week) === day.value)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }));

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Manajemen Input Jadwal</h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint} className="h-9 border-slate-200">
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
            <Button onClick={addRow} variant="secondary" className="h-9 bg-white border-slate-200 hover:bg-slate-50">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Baris
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="h-9 bg-[#8B0000] hover:bg-[#7c0000] text-white shadow-md">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 print:block">
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">Jadwal Pelajaran</h1>
            <h2 className="text-xl uppercase">{className}</h2>
            <hr className="my-4 border-t-2 border-black" />
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm print:border-none">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider print:bg-gray-100">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-100">Hari</th>
                  <th className="px-6 py-4 border-b border-slate-100">Waktu</th>
                  <th className="px-6 py-4 border-b border-slate-100">Mata Pelajaran</th>
                  <th className="px-6 py-4 border-b border-slate-100">Guru Pengampu</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic">
                      Belum ada jadwal. Klik "Tambah Baris" untuk menyusun jadwal baru.
                    </td>
                  </tr>
                )}
                {schedules.map((item, index) => {
                  const currentSubject = subjects.find(s => s.id === item.subject_id);
                  const currentTeacher = teachers.find(t => t.id === item.teacher_id);
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="print:hidden">
                          <Select
                            value={String(item.day_of_week)}
                            onValueChange={(v) => v && updateRow(index, 'day_of_week', parseInt(v))}
                          >
                            <SelectTrigger className="w-36 h-10 border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <span className="hidden print:inline font-medium">
                          {DAYS_OF_WEEK.find(d => d.value === String(item.day_of_week))?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 print:hidden">
                          <Input
                            type="time"
                            value={item.start_time}
                            onChange={(e) => updateRow(index, 'start_time', e.target.value)}
                            className="w-28 h-10 border-slate-200 font-medium"
                          />
                          <span className="text-slate-400">—</span>
                          <Input
                            type="time"
                            value={item.end_time}
                            onChange={(e) => updateRow(index, 'end_time', e.target.value)}
                            className="w-28 h-10 border-slate-200 font-medium"
                          />
                        </div>
                        <span className="hidden print:inline">
                          {item.start_time} - {item.end_time}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="print:hidden">
                          <Select
                            value={item.subject_id}
                            onValueChange={(v) => updateRow(index, 'subject_id', v)}
                          >
                            <SelectTrigger className="min-w-[200px] h-10 border-slate-200">
                              <SelectValue placeholder="Pilih Mapel">
                                {currentSubject?.name || <span className="text-slate-400">Pilih Mapel</span>}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <span className="hidden print:inline font-semibold">
                          {currentSubject?.name || '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="print:hidden">
                          <Select
                            value={item.teacher_id}
                            onValueChange={(v) => updateRow(index, 'teacher_id', v)}
                          >
                            <SelectTrigger className="min-w-[200px] h-10 border-slate-200">
                              <SelectValue placeholder="Pilih Guru">
                                {currentTeacher?.full_name || <span className="text-slate-400">Pilih Guru</span>}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <span className="hidden print:inline text-slate-700">
                          {currentTeacher?.full_name || '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center print:hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-300 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => removeRow(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="h-8 w-1 bg-[#8B0000] rounded-full" />
            Hasil Jadwal Mingguan
          </h3>
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono">
            Preview Mode
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {groupedSchedules.map((day) => (
            <Card key={day.value} className="border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className={`py-3 px-4 ${
                day.value === '1' ? 'bg-red-50 text-red-700' :
                day.value === '2' ? 'bg-orange-50 text-orange-700' :
                day.value === '3' ? 'bg-yellow-50 text-yellow-700' :
                day.value === '4' ? 'bg-green-50 text-green-700' :
                day.value === '5' ? 'bg-blue-50 text-blue-700' :
                'bg-slate-50 text-slate-700'
              }`}>
                <CardTitle className="text-sm font-bold uppercase tracking-widest">{day.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {day.items.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {day.items.map((item, idx) => {
                      const subject = subjects.find(s => s.id === item.subject_id);
                      const teacher = teachers.find(t => t.id === item.teacher_id);
                      return (
                        <div key={idx} className="p-3 space-y-2 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-[#8B0000] leading-tight line-clamp-2">
                              {subject?.name || '---'}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              {item.start_time} - {item.end_time}
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium pt-0.5">
                              {teacher?.full_name || '---'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-[10px] text-slate-400 italic">Tidak ada jadwal</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
