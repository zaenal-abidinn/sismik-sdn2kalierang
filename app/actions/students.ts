'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { studentSchema } from '@/lib/validations/schemas';
import type { ActionResponse, Student } from '@/types';

export async function getStudents(params?: {
  search?: string;
  classId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('students')
    .select('*', { count: 'exact' })
    .order('full_name', { ascending: true });

  if (params?.search) {
    query = query.or(`full_name.ilike.%${params.search}%,nis.ilike.%${params.search}%`);
  }

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { data: [], total: 0, error: error.message };
  }

  // If classId filter, we need to join through enrollments
  if (params?.classId) {
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('student_id')
      .eq('class_id', params.classId);

    const enrolledStudentIds = enrollments?.map((e) => e.student_id) ?? [];
    const filtered = data?.filter((s) => enrolledStudentIds.includes(s.id)) ?? [];
    return { data: filtered, total: filtered.length, error: null };
  }

  return { data: data ?? [], total: count ?? 0, error: null };
}

export async function getStudentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Student;
}

export async function createStudent(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    nis: formData.get('nis') as string,
    full_name: formData.get('full_name') as string,
    nickname: (formData.get('nickname') as string) || undefined,
    gender: formData.get('gender') as string,
    birth_date: formData.get('birth_date') as string,
    birth_place: formData.get('birth_place') as string,
    religion: formData.get('religion') as string,
    address: formData.get('address') as string,
    parent_name: formData.get('parent_name') as string,
    parent_phone: (formData.get('parent_phone') as string) || undefined,
    status: (formData.get('status') as string) || 'aktif',
  };

  const validated = studentSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Data tidak valid',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('students').insert([validated.data]);

  if (error) {
    if (error.code === '23505') {
      return { success: false, message: 'NIS sudah terdaftar' };
    }
    return { success: false, message: `Gagal menambah siswa: ${error.message}` };
  }

  revalidatePath('/siswa');
  return { success: true, message: 'Siswa berhasil ditambahkan' };
}

export async function updateStudent(
  id: string,
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    nis: formData.get('nis') as string,
    full_name: formData.get('full_name') as string,
    nickname: (formData.get('nickname') as string) || undefined,
    gender: formData.get('gender') as string,
    birth_date: formData.get('birth_date') as string,
    birth_place: formData.get('birth_place') as string,
    religion: formData.get('religion') as string,
    address: formData.get('address') as string,
    parent_name: formData.get('parent_name') as string,
    parent_phone: (formData.get('parent_phone') as string) || undefined,
    status: (formData.get('status') as string) || 'aktif',
  };

  const validated = studentSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Data tidak valid',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update(validated.data)
    .eq('id', id);

  if (error) {
    return { success: false, message: `Gagal mengubah data siswa: ${error.message}` };
  }

  revalidatePath('/siswa');
  revalidatePath(`/siswa/${id}`);
  return { success: true, message: 'Data siswa berhasil diperbarui' };
}

export async function deleteStudent(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from('students').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Gagal menghapus siswa: ${error.message}` };
  }

  revalidatePath('/siswa');
  return { success: true, message: 'Siswa berhasil dihapus' };
}
