'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectSchema, type SubjectFormValues } from '@/lib/validations/schemas';
import { createSubject, updateSubject } from '@/app/actions/teachers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SubjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: any; // If editing
}

export function SubjectForm({ open, onOpenChange, subject }: SubjectFormProps) {
  const isEditing = !!subject;
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: subject?.name || '',
      code: subject?.code || '',
      grade_level: subject?.grade_level || 1,
    },
  });

  const [state, formAction, pending] = useActionState(
    isEditing ? updateSubject.bind(null, subject.id) : createSubject,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onOpenChange(false);
      if (!isEditing) form.reset();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, onOpenChange, isEditing, form]);

  useEffect(() => {
    if (open && isEditing && subject) {
      form.reset({
        name: subject.name,
        code: subject.code,
        grade_level: subject.grade_level,
      });
    }
  }, [open, isEditing, subject, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</DialogTitle>
          <DialogDescription>
            Masukkan detail mata pelajaran di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Mapel</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Contoh: MAT, BIN, IPA" 
                      {...field} 
                      name="code" // Explicit name for FormData
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Mata Pelajaran</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Contoh: Matematika" 
                      {...field} 
                      name="name" // Explicit name for FormData
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Untuk Kelas (Level)</FormLabel>
                  <input type="hidden" name="grade_level" value={field.value} />
                  <Select
                    onValueChange={(val) => val && field.onChange(parseInt(val))}
                    value={field.value?.toString() || "1"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Level Kelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Kelas {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending} className="bg-[#8B0000] hover:bg-[#7c0000]">
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Simpan Perubahan' : 'Tambah Mapel'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
