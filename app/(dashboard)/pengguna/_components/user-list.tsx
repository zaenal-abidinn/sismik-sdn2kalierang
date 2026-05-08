'use client';

import { useState, useTransition } from 'react';
import { useActionState, useEffect } from 'react';
import Link from 'next/link';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Loader2, UserCog, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { createUser, updateUser, deleteUser } from '@/app/actions/users';
import { ROLE_LABELS } from '@/types';
import type { Profile } from '@/types';
import { EmptyState } from '@/components/shared/empty-state';

interface UserListProps {
  users: Profile[];
  currentUserRole: string;
}

const roleColors: Record<string, string> = {
  superadmin: 'bg-red-100 text-red-700 border-red-200',
  kepala_sekolah: 'bg-purple-100 text-purple-700 border-purple-200',
  guru: 'bg-blue-100 text-blue-700 border-blue-200',
  tata_usaha: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const canAddDelete = (role: string) => ['superadmin', 'kepala_sekolah'].includes(role);
const canEdit = (role: string) => ['superadmin', 'kepala_sekolah', 'tata_usaha'].includes(role);

// ─── Edit Dialog ────────────────────────────────────────────────────────────
function EditUserDialog({
  user,
  currentUserRole,
  open,
  onOpenChange,
}: {
  user: Profile;
  currentUserRole: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [role, setRole] = useState<string>(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateUser(user.user_id, {
        full_name: fullName,
        phone: phone || undefined,
        // Tata Usaha tidak bisa ubah role
        ...(canAddDelete(currentUserRole) ? { role } : {}),
      });
      if (res.success) {
        toast.success(res.message);
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Telepon</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nomor telepon"
            />
          </div>
          {canAddDelete(currentUserRole) && (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as string)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kepala_sekolah">Kepala Sekolah</SelectItem>
                  <SelectItem value="guru">Guru</SelectItem>
                  <SelectItem value="tata_usaha">Tata Usaha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan Perubahan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm ──────────────────────────────────────────────────────────
function DeleteUserAlert({
  user,
  open,
  onOpenChange,
}: {
  user: Profile;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteUser(user.user_id);
      if (res.success) {
        toast.success(res.message);
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
          <AlertDialogDescription>
            Akun <strong>{user.full_name}</strong> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── User Row ────────────────────────────────────────────────────────────────
function UserRow({
  user,
  index,
  currentUserRole,
}: {
  user: Profile;
  index: number;
  currentUserRole: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <TableRow key={user.id} className="group">
        <TableCell className="text-muted-foreground">{index + 1}</TableCell>

        {/* Nama — klik menuju profil */}
        <TableCell>
          <Link
            href={`/profil/${user.user_id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit"
          >
            <Avatar className="h-9 w-9">
              {user.photo_url && <AvatarImage src={user.photo_url} alt={user.full_name} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                {user.full_name}
              </p>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
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

        {/* Aksi */}
        <TableCell>
          <div className="flex items-center gap-1">
            {canEdit(currentUserRole) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setEditOpen(true)}
                title="Edit pengguna"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canAddDelete(currentUserRole) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
                title="Hapus pengguna"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      <EditUserDialog
        user={user}
        currentUserRole={currentUserRole}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteUserAlert user={user} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function UserList({ users, currentUserRole }: UserListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createUser, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      const timer = setTimeout(() => setDialogOpen(false), 0);
      return () => clearTimeout(timer);
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Tombol Tambah — hanya untuk admin & kepala sekolah */}
      {canAddDelete(currentUserRole) && (
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
      )}

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
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, i) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    index={i}
                    currentUserRole={currentUserRole}
                  />
                ))}
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
