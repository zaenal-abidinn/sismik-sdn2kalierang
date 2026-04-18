'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';
import { eventSchema } from '@/lib/validations/schemas';
import type { ActionResponse } from '@/types';

export async function getEvents(params?: { eventType?: string; month?: number; year?: number }) {
  const supabase = await createClient();
  let query = supabase
    .from('academic_events')
    .select('*, creator:profiles(full_name)')
    .order('start_date', { ascending: true });

  if (params?.eventType) {
    query = query.eq('event_type', params.eventType);
  }

  if (params?.month && params?.year) {
    const startDate = `${params.year}-${String(params.month).padStart(2, '0')}-01`;
    const endDate = `${params.year}-${String(params.month).padStart(2, '0')}-31`;
    query = query.gte('start_date', startDate).lte('start_date', endDate);
  }

  const { data } = await query;
  return data ?? [];
}

export async function createEvent(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const profile = await getCurrentUser();
  if (!profile) return { success: false, message: 'Unauthorized' };

  const rawData = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    event_type: formData.get('event_type') as string,
  };

  const validated = eventSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('academic_events').insert([
    { ...validated.data, created_by: profile.id },
  ]);

  if (error) {
    return { success: false, message: `Gagal menambah acara: ${error.message}` };
  }

  revalidatePath('/kalender');
  return { success: true, message: 'Acara berhasil ditambahkan' };
}

export async function deleteEvent(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from('academic_events').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Gagal menghapus acara: ${error.message}` };
  }

  revalidatePath('/kalender');
  return { success: true, message: 'Acara berhasil dihapus' };
}
