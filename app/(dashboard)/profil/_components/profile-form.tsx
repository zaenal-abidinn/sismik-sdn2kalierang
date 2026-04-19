'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile } from '@/app/actions/profiles';
import { ROLE_LABELS } from '@/types';
import type { Profile } from '@/types';
import { ImageUpload } from '@/components/shared/image-upload';

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url ?? '');

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isGuru = profile.role === 'guru';

  async function handleSave() {
    if (isGuru) return;
    setSaving(true);
    try {
      const res = await updateProfile(profile.id, {
        full_name: fullName,
        phone: phone || '',
        photo_url: photoUrl || '',
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Informasi Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            {isGuru ? (
              <Avatar className="h-24 w-24 border-2 border-slate-100 ring-2 ring-slate-50">
                <AvatarImage src={photoUrl} className="object-cover" />
                <AvatarFallback className="bg-red-50 text-[#8B0000] text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <ImageUpload 
                value={photoUrl}
                onChange={(url) => setPhotoUrl(url)}
                onRemove={() => setPhotoUrl('')}
                folder="users"
              />
            )}
            <div className="text-center">
              <p className="font-semibold text-lg">{profile.full_name}</p>
              <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isGuru}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                disabled={isGuru}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={ROLE_LABELS[profile.role]} disabled className="bg-muted" />
            </div>
          </div>

          {!isGuru && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Perubahan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
