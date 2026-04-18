export type UserRole = 'superadmin' | 'kepala_sekolah' | 'guru' | 'tata_usaha';

export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpha';

export type GradeTypeCode = 'UH' | 'UTS' | 'UAS' | 'tugas' | 'praktik';

export type EventType = 'libur' | 'ujian' | 'kegiatan' | 'rapat';

export type StudentStatus = 'aktif' | 'pindah' | 'lulus' | 'keluar';

export type EnrollmentStatus = 'aktif' | 'pindah' | 'naik_kelas';

// ============================================
// Database Row Types
// ============================================

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  photo_url: string | null;
  phone: string | null;
  created_at: string;
}

export interface SchoolYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Semester {
  id: string;
  school_year_id: string;
  name: string;
  semester_number: number;
  start_date: string;
  end_date: string;
  // Joined
  school_year?: SchoolYear;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  school_year_id: string;
  homeroom_teacher_id: string | null;
  // Joined
  school_year?: SchoolYear;
  homeroom_teacher?: Profile;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  grade_level: number;
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  semester_id: string;
  // Joined
  teacher?: Profile;
  subject?: Subject;
  class?: Class;
  semester?: Semester;
}

export interface Student {
  id: string;
  nis: string;
  full_name: string;
  nickname: string | null;
  gender: 'L' | 'P';
  birth_date: string;
  birth_place: string;
  religion: string;
  address: string;
  parent_name: string;
  parent_phone: string | null;
  photo_url: string | null;
  status: StudentStatus;
  created_at: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  school_year_id: string;
  status: EnrollmentStatus;
  // Joined
  student?: Student;
  class?: Class;
  school_year?: SchoolYear;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  recorded_by: string;
  // Joined
  student?: Student;
  class?: Class;
  recorder?: Profile;
}

export interface GradeType {
  id: string;
  name: string;
  code: GradeTypeCode;
  weight_percentage: number;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  teacher_id: string;
  semester_id: string;
  grade_type_id: string;
  score: number;
  date_recorded: string;
  notes: string | null;
  // Joined
  student?: Student;
  subject?: Subject;
  teacher?: Profile;
  semester?: Semester;
  grade_type?: GradeType;
}

export interface ReportCard {
  id: string;
  student_id: string;
  semester_id: string;
  final_grades: Record<string, { subject_name: string; score: number; grade: string }>;
  attendance_summary: { hadir: number; sakit: number; izin: number; alpha: number };
  homeroom_notes: string | null;
  generated_at: string;
  // Joined
  student?: Student;
  semester?: Semester;
}

export interface AcademicEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  event_type: EventType;
  created_by: string;
  // Joined
  creator?: Profile;
}

// ============================================
// Insert Types (for forms)
// ============================================

export type InsertStudent = Omit<Student, 'id' | 'created_at' | 'photo_url'> & {
  photo_url?: string | null;
};

export type UpdateStudent = Partial<InsertStudent>;

export type InsertAttendance = Omit<Attendance, 'id' | 'student' | 'class' | 'recorder'>;

export type InsertGrade = Omit<Grade, 'id' | 'student' | 'subject' | 'teacher' | 'semester' | 'grade_type'>;

export type InsertAcademicEvent = Omit<AcademicEvent, 'id' | 'creator'>;
