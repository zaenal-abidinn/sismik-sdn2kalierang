'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil } from 'lucide-react';
import { SubjectForm } from './subject-form';

interface SubjectFormWrapperProps {
  subject?: any;
  mode?: 'add' | 'edit';
}

export function SubjectFormWrapper({ subject, mode = 'add' }: SubjectFormWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {mode === 'add' ? (
        <Button onClick={() => setOpen(true)} className="bg-[#8B0000] hover:bg-[#7c0000]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Mapel
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-400 hover:text-[#8B0000] hover:bg-red-50"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <SubjectForm 
        open={open} 
        onOpenChange={setOpen} 
        subject={subject} 
      />
    </>
  );
}
