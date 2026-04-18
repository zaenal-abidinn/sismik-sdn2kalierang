'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Loader2, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { createUser } from '@/app/actions/users';
import { ROLE_LABELS } from '@/types';
import type { Profile } from '@/types';
import { EmptyState } from '@/components/shared/empty-state';
import { useState } from 'react';

interface UserListProps {
  users: Profile[];
}

const roleColors: Record<string, string> = {
  kepala_sekolah: 'bg-purple-100 text-purple-700 border-purple-200',
  guru: 'bg-blue-100 text-blue-700 border-blue-200',
  tata_usaha: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function UserList({ users }: UserListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createUser, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      // Defer to avoid synchronous setState in effect warning
      const timer = setTimeout(() => setDialogOpen(false), 0);
      return () => clearTimeout(timer);
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pengguna
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Akun Baru</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input name="full_name" placeholder="Nama lengkap" required />
                {state?.errors?.full_name && (
                  <p className="text-sm text-destructive">{state.errors.full_name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="email@sekolah.id" required />
                {state?.errors?.email && (
                  <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" defaultValue="guru">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kepala_sekolah">Kepala Sekolah</SelectItem>
                    <SelectItem value="guru">Guru</SelectItem>
                    <SelectItem value="tata_usaha">Tata Usaha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input name="password" type="password" placeholder="Minimal 6 karakter" required />
                {state?.errors?.password && (
                  <p className="text-sm text-destructive">{state.errors.password[0]}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Buat Akun
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {users.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Terdaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, i) => {
                  const initials = user.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[user.role]}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.phone || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={UserCog}
          title="Belum ada pengguna"
          description="Tambahkan pengguna pertama untuk sistem."
        />
      )}
    </div>
  );
}
