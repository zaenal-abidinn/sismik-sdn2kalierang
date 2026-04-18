'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { MoreHorizontal, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { deleteStudent } from '@/app/actions/students';
import { GENDER_LABELS } from '@/types';
import type { Student } from '@/types';

interface StudentTableProps {
  students: Student[];
  total: number;
}

const statusColors: Record<string, string> = {
  aktif: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pindah: 'bg-amber-100 text-amber-700 border-amber-200',
  lulus: 'bg-blue-100 text-blue-700 border-blue-200',
  keluar: 'bg-red-100 text-red-700 border-red-200',
};

export function StudentTable({ students, total }: StudentTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteStudent(deleteId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setDeleteId(null);
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Belum ada data siswa"
        description="Tambahkan siswa pertama untuk memulai pengelolaan data."
        action={
          <Button render={<Link href="/siswa/tambah" />} />
        }
      />
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>JK</TableHead>
              <TableHead>Agama</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.id} className="group">
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">{student.nis}</TableCell>
                <TableCell>
                  <Link
                    href={`/siswa/${student.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {student.full_name}
                  </Link>
                </TableCell>
                <TableCell>{GENDER_LABELS[student.gender]}</TableCell>
                <TableCell>{student.religion}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[student.status]}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />}>
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/siswa/${student.id}`} />}>
                        <Eye className="mr-2 h-4 w-4" />
                        Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/siswa/${student.id}/edit`} />}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(student.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>Menampilkan {students.length} dari {total} siswa</span>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Siswa"
        description="Apakah Anda yakin ingin menghapus siswa ini? Semua data terkait (absensi, nilai) juga akan dihapus."
        confirmText="Hapus"
        onConfirm={handleDelete}
      />
    </>
  );
}
