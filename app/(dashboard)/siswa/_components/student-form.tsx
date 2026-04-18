'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createStudent, updateStudent } from '@/app/actions/students';
import { RELIGION_OPTIONS } from '@/types';
import type { Student, ActionResponse } from '@/types';

interface StudentFormProps {
  student?: Student;
}

export function StudentForm({ student }: StudentFormProps) {
  const router = useRouter();
  const isEditing = !!student;

  const boundAction = isEditing
    ? updateStudent.bind(null, student.id)
    : createStudent;

  const [state, formAction, pending] = useActionState(
    boundAction as (state: ActionResponse | undefined, formData: FormData) => Promise<ActionResponse>,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push('/siswa');
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Pribadi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nis">NIS *</Label>
                <Input
                  id="nis"
                  name="nis"
                  defaultValue={student?.nis}
                  placeholder="Nomor Induk Siswa"
                  required
                />
                {state?.errors?.nis && (
                  <p className="text-sm text-destructive">{state.errors.nis[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <Select name="gender" defaultValue={student?.gender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={student?.full_name}
                placeholder="Nama lengkap sesuai akta"
                required
              />
              {state?.errors?.full_name && (
                <p className="text-sm text-destructive">{state.errors.full_name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nama Panggilan</Label>
              <Input
                id="nickname"
                name="nickname"
                defaultValue={student?.nickname ?? ''}
                placeholder="Nama panggilan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_place">Tempat Lahir *</Label>
                <Input
                  id="birth_place"
                  name="birth_place"
                  defaultValue={student?.birth_place}
                  placeholder="Tempat lahir"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  defaultValue={student?.birth_date}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="religion">Agama *</Label>
              <Select name="religion" defaultValue={student?.religion}>
                <SelectTrigger id="religion">
                  <SelectValue placeholder="Pilih agama" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGION_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={student?.status ?? 'aktif'}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status siswa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="pindah">Pindah</SelectItem>
                  <SelectItem value="lulus">Lulus</SelectItem>
                  <SelectItem value="keluar">Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Orang Tua & Alamat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Orang Tua & Alamat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent_name">Nama Orang Tua/Wali *</Label>
              <Input
                id="parent_name"
                name="parent_name"
                defaultValue={student?.parent_name}
                placeholder="Nama orang tua atau wali"
                required
              />
              {state?.errors?.parent_name && (
                <p className="text-sm text-destructive">{state.errors.parent_name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_phone">No. Telepon Orang Tua</Label>
              <Input
                id="parent_phone"
                name="parent_phone"
                defaultValue={student?.parent_phone ?? ''}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={student?.address}
                placeholder="Alamat lengkap siswa"
                rows={4}
                required
              />
              {state?.errors?.address && (
                <p className="text-sm text-destructive">{state.errors.address[0]}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/siswa')}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : isEditing ? (
            'Simpan Perubahan'
          ) : (
            'Tambah Siswa'
          )}
        </Button>
      </div>
    </form>
  );
}
