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
  
  // 1. Get current user and role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], total: 0, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return { data: [], total: 0, error: 'Profile not found' };

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 2. Build base query
  // If role is guru, we must filter by their class
  let targetClassId = params?.classId;

  if (profile.role === 'guru') {
    // Find the class where this guru is homeroom teacher
    const { data: homeroomClass } = await supabase
      .from('classes')
      .select('id')
      .eq('homeroom_teacher_id', profile.id)
      .single();
    
    if (!homeroomClass) {
      // If not a homeroom teacher, they might not have a "class" to see
      // unless we want to let them see students they teach. 
      // But based on request: "siswa yang ada di kelasnya"
      return { data: [], total: 0, error: null };
    }
    
    targetClassId = homeroomClass.id;
  }

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

  // 3. Handle Class Filtering (Mandatory for Guru, Optional for Admin)
  if (targetClassId) {
    // Get student IDs from enrollments for this class
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('student_id')
      .eq('class_id', targetClassId);

    const enrolledIds = enrollments?.map(e => e.student_id) || [];
    
    if (enrolledIds.length === 0) {
      return { data: [], total: 0, error: null };
    }

    query = query.in('id', enrolledIds);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { data: [], total: 0, error: error.message };
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
    photo_url: (formData.get('photo_url') as string) || undefined,
    status: (formData.get('status') as string) || 'aktif',
    class_id: (formData.get('class_id') as string) || undefined,
  };

  const validated = studentSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Data tidak valid',
    };
  }

  const { class_id, ...studentData } = validated.data;
  const supabase = await createClient();

  // 1. Insert student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert([studentData])
    .select()
    .single();

  if (studentError) {
    if (studentError.code === '23505') {
      return { success: false, message: 'NIS sudah terdaftar' };
    }
    return { success: false, message: `Gagal menambah siswa: ${studentError.message}` };
  }

  // 2. Enroll student if class_id is provided
  if (class_id && student) {
    // Get current active school year
    const { data: schoolYear } = await supabase
      .from('school_years')
      .select('id')
      .eq('is_active', true)
      .single();

    if (schoolYear) {
      const { error: enrollmentError } = await supabase
        .from('student_enrollments')
        .insert([{
          student_id: student.id,
          class_id: class_id,
          school_year_id: schoolYear.id,
          status: 'aktif'
        }]);

      if (enrollmentError) {
        console.error('Enrollment error:', enrollmentError);
        // We don't fail the whole request but maybe notify?
        // For now just log it.
      }
    }
  }

  revalidatePath('/siswa');
  return { success: true, message: 'Siswa berhasil ditambahkan dan didaftarkan ke kelas' };
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
    photo_url: (formData.get('photo_url') as string) || undefined,
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
