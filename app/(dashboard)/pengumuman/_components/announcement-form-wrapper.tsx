'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Bell } from 'lucide-react';
import { createAnnouncement, updateAnnouncement } from '@/app/actions/announcements';
import { toast } from 'sonner';

interface AnnouncementFormWrapperProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    target_role: string;
  };
  trigger?: React.ReactElement;
}

export function AnnouncementFormWrapper({ initialData, trigger }: AnnouncementFormWrapperProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const res = initialData 
      ? await updateAnnouncement(initialData.id, undefined, formData)
      : await createAnnouncement(undefined, formData);
    
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
          trigger || (
            <Button className="bg-[#8B0000] hover:bg-[#7c0000] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengumuman
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Bell className="h-5 w-5 text-[#8B0000]" />
            {initialData ? 'Edit Pengumuman' : 'Tulis Pengumuman Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Judul Pengumuman</label>
            <Input 
              name="title" 
              defaultValue={initialData?.title}
              placeholder="Contoh: Libur Hari Raya" 
              required 
              className="border-slate-200 focus:ring-[#8B0000]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Target Penerima</label>
            <Select name="target_role" defaultValue={initialData?.target_role || "semua"}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Pilih Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua (Umum)</SelectItem>
                <SelectItem value="guru">Khusus Guru</SelectItem>
                <SelectItem value="siswa">Khusus Siswa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Isi Pengumuman</label>
            <Textarea 
              name="content" 
              defaultValue={initialData?.content}
              placeholder="Tuliskan isi informasi di sini..." 
              required 
              rows={6}
              className="border-slate-200 focus:ring-[#8B0000] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              {isPending ? (initialData ? 'Menyimpan...' : 'Menerbitkan...') : (initialData ? 'Simpan' : 'Terbitkan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
