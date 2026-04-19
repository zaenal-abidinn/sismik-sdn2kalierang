'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  folder?: string;
}

export function ImageUpload({ value, onChange, onRemove, folder = 'profiles' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Add cache-busting timestamp
      onChange(`${publicUrl}?t=${Date.now()}`);
      toast.success('Gambar berhasil diunggah');
    } catch (error: any) {
      toast.error(`Gagal mengunggah gambar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-slate-100 ring-2 ring-slate-50">
          <AvatarImage src={value} className="object-cover" />
          <AvatarFallback className="bg-slate-50 text-slate-300">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="relative overflow-hidden border-slate-200"
          onClick={() => document.getElementById('image-upload-input')?.click()}
        >
          {uploading ? 'Mengunggah...' : value ? 'Ganti Foto' : 'Pilih Foto'}
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </Button>
        <p className="text-[10px] text-muted-foreground">
          Format: JPG, PNG. Maksimal 2MB.
        </p>
      </div>
    </div>
  );
}
