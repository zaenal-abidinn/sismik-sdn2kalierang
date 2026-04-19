'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, User, Calendar } from 'lucide-react';
import { deleteAnnouncement } from '@/app/actions/announcements';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/empty-state';

interface AnnouncementListProps {
  announcements: any[];
  canManage: boolean;
}

export function AnnouncementList({ announcements, canManage }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Belum ada pengumuman"
        description="Pantau terus halaman ini untuk informasi terbaru dari sekolah."
      />
    );
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      const res = await deleteAnnouncement(id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      {announcements.map((item) => (
        <Card key={item.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-red-50 text-[#8B0000] border-0 text-[10px] uppercase tracking-wider font-bold">
                  {item.target_role === 'semua' ? 'UMUM' : `KHUSUS ${item.target_role.toUpperCase()}`}
                </Badge>
                <div className="flex items-center text-[10px] text-slate-400 font-medium">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(item.created_at), 'dd MMMM yyyy', { locale: id })}
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-slate-800 leading-tight">
                {item.title}
              </CardTitle>
            </div>
            {canManage && (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {item.content}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center text-[11px] text-slate-400 font-medium">
                <User className="h-3 w-3 mr-1.5" />
                Diterbitkan oleh: <span className="text-slate-600 ml-1 font-bold">{item.created_by?.full_name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
