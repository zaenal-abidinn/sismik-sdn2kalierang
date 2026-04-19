'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, User, Phone, Camera } from 'lucide-react';
import { updateProfile } from '@/app/actions/profiles';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/image-upload';

interface TeacherEditFormProps {
  teacher: any;
}

export function TeacherEditForm({ teacher }: TeacherEditFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [fullName, setFullName] = useState(teacher.full_name);
  const [phone, setPhone] = useState(teacher.phone || '');
  const [photoUrl, setPhotoUrl] = useState(teacher.photo_url || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    const res = await updateProfile(teacher.id, {
      full_name: fullName,
      phone: phone || null,
      photo_url: photoUrl || null,
    });
    
    setIsPending(false);
    if (res.success) {
      toast.success(res.message);
      setOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#8B0000] hover:bg-red-50">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <User className="h-5 w-5 text-[#8B0000]" />
            Edit Profil Guru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Lengkap" 
                required 
                className="pl-10 border-slate-200 focus:ring-[#8B0000]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">No. Telepon</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx" 
                className="pl-10 border-slate-200 focus:ring-[#8B0000]"
              />
            </div>
          </div>

          <div className="space-y-2 flex flex-col items-center pb-4">
            <Label className="text-sm font-bold text-slate-700 self-start mb-2">Foto Profil</Label>
            <ImageUpload 
              value={photoUrl}
              onChange={(url) => setPhotoUrl(url)}
              onRemove={() => setPhotoUrl('')}
              folder="teachers"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-slate-200"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-[#8B0000] hover:bg-[#7c0000] text-white min-w-[120px]"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
