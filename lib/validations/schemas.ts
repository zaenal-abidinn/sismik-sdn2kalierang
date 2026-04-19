import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  confirm_password: z.string().min(6, { message: 'Konfirmasi password minimal 6 karakter' }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Password tidak cocok",
  path: ["confirm_password"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  phone: z.string().optional(),
});

export const studentSchema = z.object({
  nis: z.string().min(1, { message: 'NIS wajib diisi' }),
  full_name: z.string().min(2, { message: 'Nama lengkap minimal 2 karakter' }),
  nickname: z.string().optional(),
  gender: z.enum(['L', 'P'], { message: 'Pilih jenis kelamin' }),
  birth_date: z.string().min(1, { message: 'Tanggal lahir wajib diisi' }),
  birth_place: z.string().min(1, { message: 'Tempat lahir wajib diisi' }),
  religion: z.string().min(1, { message: 'Agama wajib diisi' }),
  address: z.string().min(1, { message: 'Alamat wajib diisi' }),
  parent_name: z.string().min(2, { message: 'Nama orang tua minimal 2 karakter' }),
  parent_phone: z.string().optional(),
  status: z.enum(['aktif', 'pindah', 'lulus', 'keluar']).default('aktif'),
  class_id: z.string().uuid({ message: 'Pilih kelas yang valid' }).optional(),
});

export const attendanceSchema = z.object({
  student_id: z.string().uuid(),
  class_id: z.string().uuid(),
  date: z.string(),
  status: z.enum(['hadir', 'sakit', 'izin', 'alpha']),
  notes: z.string().optional(),
});

export const gradeSchema = z.object({
  student_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  semester_id: z.string().uuid(),
  grade_type_id: z.string().uuid(),
  score: z.number().min(0).max(100, { message: 'Nilai maksimal 100' }),
  date_recorded: z.string(),
  notes: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(2, { message: 'Nama mata pelajaran minimal 2 karakter' }),
  code: z.string().min(1, { message: 'Kode wajib diisi' }),
  grade_level: z.number().min(1).max(6, { message: 'Kelas harus antara 1-6' }),
});

export const classSchema = z.object({
  name: z.string().min(1, { message: 'Nama kelas wajib diisi' }),
  grade_level: z.number().min(1).max(6),
  school_year_id: z.string().uuid(),
  homeroom_teacher_id: z.string().uuid().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2, { message: 'Judul minimal 2 karakter' }),
  description: z.string().optional(),
  start_date: z.string().min(1, { message: 'Tanggal mulai wajib diisi' }),
  end_date: z.string().min(1, { message: 'Tanggal selesai wajib diisi' }),
  event_type: z.enum(['libur', 'ujian', 'kegiatan', 'rapat']),
});

export const userSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  full_name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  role: z.enum(['superadmin', 'kepala_sekolah', 'guru', 'tata_usaha']),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type StudentFormValues = z.infer<typeof studentSchema>;
export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
export type GradeFormValues = z.infer<typeof gradeSchema>;
export type SubjectFormValues = z.infer<typeof subjectSchema>;
export type ClassFormValues = z.infer<typeof classSchema>;
export type EventFormValues = z.infer<typeof eventSchema>;
export type UserFormValues = z.infer<typeof userSchema>;
