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
import { Download, Loader2 } from 'lucide-react';
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

const months = [
  { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
  { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

export function RecapView({ classes }: RecapViewProps) {
  const [classId, setClassId] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year] = useState(String(new Date().getFullYear()));
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadRecap() {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await getAttendanceRecap(classId, Number(month), Number(year));

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
      XLSX.writeFile(wb, `rekap-absensi-${month}-${year}.xlsx`);
      toast.success('File Excel berhasil diunduh');
    } catch {
      toast.error('Gagal mengekspor ke Excel');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
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
        <Select value={month} onValueChange={(v) => v && setMonth(v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={loadRecap} disabled={!classId || loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Tampilkan
        </Button>
        {recapData.length > 0 && (
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        )}
      </div>

      {recapData.length > 0 && (
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
      )}
    </div>
  );
}
