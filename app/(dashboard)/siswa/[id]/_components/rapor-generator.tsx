'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, Wand2 } from 'lucide-react';
import { generateReportCard } from '@/app/actions/report-cards';
import { toast } from 'sonner';

interface RaporGeneratorProps {
  studentId: string;
  semesters: { id: string; name: string }[];
}

export function RaporGenerator({ studentId, semesters }: RaporGeneratorProps) {
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!semesterId) {
      toast.error('Pilih semester terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const res = await generateReportCard(studentId, semesterId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Terjadi kesalahan saat membuat rapor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Pembuatan Rapor
        </CardTitle>
        <CardDescription>
          Generate laporan hasil belajar siswa berdasarkan nilai yang ada di sistem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pilih Semester
          </label>
          <Select value={semesterId || ''} onValueChange={setSemesterId}>
            <SelectTrigger className="h-11 border-slate-200">
              <SelectValue placeholder="Pilih Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id} className="py-2.5">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={loading || !semesterId}
          className="w-full h-11 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Proses & Generate Rapor
        </Button>

        <p className="text-[10px] text-muted-foreground italic text-center">
          * Rapor yang sudah digenerate dapat dilihat di menu Rapor.
        </p>
      </CardContent>
    </Card>
  );
}
