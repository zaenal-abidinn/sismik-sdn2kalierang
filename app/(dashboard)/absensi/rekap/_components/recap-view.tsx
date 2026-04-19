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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getAttendanceRecap } from '@/app/actions/attendance';
import type { Attendance } from '@/types';

interface RecapViewProps {
  classes: { id: string; name: string }[];
}

interface RecapData {
  studentId: string;
  studentName: string;
  nis: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  percentage: number;
}

export function RecapView({ classes }: RecapViewProps) {
  const [classId, setClassId] = useState('');
  const [recapType, setRecapType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadRecap() {
    if (!classId) return;
    setLoading(true);
    try {
      let start = startDate;
      let end = endDate;

      if (recapType === 'monthly') {
        const date = new Date(startDate);
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        start = `${y}-${String(m).padStart(2, '0')}-01`;
        end = `${y}-${String(m).padStart(2, '0')}-31`;
      } else if (recapType === 'yearly') {
        const y = new Date(startDate).getFullYear();
        start = `${y}-01-01`;
        end = `${y}-12-31`;
      } else if (recapType === 'daily') {
        start = startDate;
        end = startDate;
      }

      const data = await getAttendanceRecap(classId, start, end);

      // Group by student
      const grouped = new Map<string, RecapData>();
      for (const record of data as Attendance[]) {
        const key = record.student_id;
        if (!grouped.has(key)) {
          grouped.set(key, {
            studentId: key,
            studentName: record.student?.full_name ?? '-',
            nis: record.student?.nis ?? '-',
            hadir: 0, sakit: 0, izin: 0, alpha: 0, total: 0, percentage: 0,
          });
        }
        const entry = grouped.get(key)!;
        if (record.status === 'hadir') entry.hadir++;
        else if (record.status === 'sakit') entry.sakit++;
        else if (record.status === 'izin') entry.izin++;
        else if (record.status === 'alpha') entry.alpha++;
        entry.total++;
      }

      const result = Array.from(grouped.values()).map((r) => ({
        ...r,
        percentage: r.total > 0 ? Math.round((r.hadir / r.total) * 100) : 0,
      }));

      result.sort((a, b) => a.studentName.localeCompare(b.studentName));
      setRecapData(result);
    } catch {
      toast.error('Gagal memuat rekap absensi');
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  async function exportToExcel() {
    if (recapData.length === 0) return;
    try {
      const XLSX = await import('xlsx');
      const wsData = [
        ['No', 'NIS', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Total', '% Kehadiran'],
        ...recapData.map((r, i) => [
          i + 1, r.nis, r.studentName, r.hadir, r.sakit, r.izin, r.alpha, r.total, `${r.percentage}%`,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');
      XLSX.writeFile(wb, `rekap-absensi-${recapType}-${startDate}.xlsx`);
      toast.success('File Excel berhasil diunduh');
    } catch {
      toast.error('Gagal mengekspor ke Excel');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 print:hidden">
        <Select value={classId} onValueChange={(v) => v && setClassId(v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Pilih Kelas" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={recapType} onValueChange={(v: any) => setRecapType(v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Jenis Rekap" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Harian</SelectItem>
            <SelectItem value="weekly">Mingguan</SelectItem>
            <SelectItem value="monthly">Bulanan</SelectItem>
            <SelectItem value="yearly">Tahunan</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
            <Input 
                type={recapType === 'yearly' ? 'number' : 'date'} 
                value={recapType === 'yearly' ? new Date(startDate).getFullYear() : startDate}
                onChange={(e) => setStartDate(recapType === 'yearly' ? `${e.target.value}-01-01` : e.target.value)}
                className="w-full sm:w-[160px]"
            />
            {recapType === 'weekly' && (
                <>
                    <span>s/d</span>
                    <Input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full sm:w-[160px]"
                    />
                </>
            )}
        </div>

        <Button onClick={loadRecap} disabled={!classId || loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Tampilkan
        </Button>
        {recapData.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        )}
      </div>

      {recapData.length > 0 && (
        <div className="space-y-4">
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">Rekap Absensi Siswa</h1>
            <h2 className="text-xl uppercase">{classes.find(c => c.id === classId)?.name}</h2>
            <p className="text-sm">Periode: {recapType === 'daily' ? startDate : recapType === 'weekly' ? `${startDate} - ${endDate}` : recapType === 'monthly' ? startDate.substring(0, 7) : recapType === 'yearly' ? startDate.substring(0, 4) : ''}</p>
            <hr className="my-4 border-t-2 border-black" />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="text-center">Hadir</TableHead>
                    <TableHead className="text-center">Sakit</TableHead>
                    <TableHead className="text-center">Izin</TableHead>
                    <TableHead className="text-center">Alpha</TableHead>
                    <TableHead className="text-center">% Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recapData.map((r, i) => (
                    <TableRow key={r.studentId}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{r.nis}</TableCell>
                      <TableCell className="font-medium">{r.studentName}</TableCell>
                      <TableCell className="text-center text-emerald-600 font-medium">{r.hadir}</TableCell>
                      <TableCell className="text-center text-amber-600 font-medium">{r.sakit}</TableCell>
                      <TableCell className="text-center text-blue-600 font-medium">{r.izin}</TableCell>
                      <TableCell className="text-center text-red-600 font-medium">{r.alpha}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${r.percentage >= 80 ? 'text-emerald-600' : r.percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {r.percentage}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
