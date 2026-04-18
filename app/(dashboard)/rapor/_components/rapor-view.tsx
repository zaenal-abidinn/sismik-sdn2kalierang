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
import { Loader2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getReportCards } from '@/app/actions/report-cards';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportCardPDF } from './report-card-pdf';
import type { ReportCard } from '@/types';

interface RaporViewProps {
  semesters: { id: string; name: string }[];
}

export function RaporView({ semesters }: RaporViewProps) {
  const [semesterId, setSemesterId] = useState('');
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadReportCards() {
    if (!semesterId) return;
    setLoading(true);
    try {
      const data = await getReportCards(semesterId);
      setReportCards(data);
    } catch {
      toast.error('Gagal memuat data rapor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={semesterId} onValueChange={(v) => v && setSemesterId(v)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Pilih Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={loadReportCards} disabled={!semesterId || loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Tampilkan
        </Button>
      </div>

      {reportCards.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Jumlah Mapel</TableHead>
                  <TableHead>Rata-rata</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportCards.map((rc, i) => {
                  const grades = rc.final_grades ? Object.values(rc.final_grades) : [];
                  const avgScore = grades.length > 0
                    ? Math.round(grades.reduce((a, b) => a + b.score, 0) / grades.length)
                    : 0;
                  return (
                    <TableRow key={rc.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{rc.student?.nis}</TableCell>
                      <TableCell className="font-medium">{rc.student?.full_name}</TableCell>
                      <TableCell>{grades.length} mapel</TableCell>
                      <TableCell>
                        <span className={`font-bold ${avgScore >= 75 ? 'text-emerald-600' : avgScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {avgScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(rc.generated_at), 'dd/MM/yyyy', { locale: idLocale })}
                      </TableCell>
                      <TableCell>
                        <PDFDownloadLink
                          document={<ReportCardPDF data={rc} />}
                          fileName={`Rapor-${rc.student?.nis}-${rc.semester?.name}.pdf`}
                        >
                          {({ loading: pdfLoading }) => (
                            <Button variant="ghost" size="sm" disabled={pdfLoading}>
                              {pdfLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportCards.length === 0 && semesterId && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm">Belum ada rapor untuk semester ini</p>
          <p className="text-xs mt-1">Buat rapor dari halaman detail siswa</p>
        </div>
      )}
    </div>
  );
}
