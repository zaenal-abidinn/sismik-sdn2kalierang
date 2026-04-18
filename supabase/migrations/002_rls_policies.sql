-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_events ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = (select auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Helper function to get current user profile id
CREATE OR REPLACE FUNCTION public.get_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE user_id = (select auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ============================================
-- PROFILES
-- ============================================
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (user_id = (select auth.uid()));

-- ============================================
-- SCHOOL_YEARS - Read by all, managed by kepala_sekolah
-- ============================================
CREATE POLICY "All can view school years" ON school_years FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah can insert school years" ON school_years FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update school years" ON school_years FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete school years" ON school_years FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- ============================================
-- SEMESTERS
-- ============================================
CREATE POLICY "All can view semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah can insert semesters" ON semesters FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update semesters" ON semesters FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete semesters" ON semesters FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- ============================================
-- CLASSES
-- ============================================
CREATE POLICY "All can view classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah can insert classes" ON classes FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update classes" ON classes FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete classes" ON classes FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- ============================================
-- SUBJECTS
-- ============================================
CREATE POLICY "All can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah can insert subjects" ON subjects FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update subjects" ON subjects FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete subjects" ON subjects FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- ============================================
-- TEACHER_SUBJECTS
-- ============================================
CREATE POLICY "All can view teacher subjects" ON teacher_subjects FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah can insert teacher subjects" ON teacher_subjects FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update teacher subjects" ON teacher_subjects FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete teacher subjects" ON teacher_subjects FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- ============================================
-- STUDENTS
-- ============================================
CREATE POLICY "All authenticated can view students" ON students FOR SELECT USING (true);
CREATE POLICY "Tata usaha and kepala sekolah can insert students" ON students FOR INSERT WITH CHECK (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can update students" ON students FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can delete students" ON students FOR DELETE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));

-- ============================================
-- STUDENT_ENROLLMENTS
-- ============================================
CREATE POLICY "All can view enrollments" ON student_enrollments FOR SELECT USING (true);
CREATE POLICY "Tata usaha and kepala sekolah can insert enrollments" ON student_enrollments FOR INSERT WITH CHECK (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can update enrollments" ON student_enrollments FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can delete enrollments" ON student_enrollments FOR DELETE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));

-- ============================================
-- ATTENDANCES
-- ============================================
CREATE POLICY "Authorized users can view attendance" ON attendances
  FOR SELECT USING (
    get_user_role() = 'kepala_sekolah' OR
    (get_user_role() = 'guru' AND class_id IN (
      SELECT id FROM classes WHERE homeroom_teacher_id = get_profile_id()
    ))
  );
CREATE POLICY "Guru can insert attendance for their classes" ON attendances
  FOR INSERT WITH CHECK (
    get_user_role() IN ('guru', 'kepala_sekolah') AND
    recorded_by = get_profile_id()
  );
CREATE POLICY "Guru can update their own attendance records" ON attendances
  FOR UPDATE USING (recorded_by = get_profile_id());

-- ============================================
-- GRADE_TYPES
-- ============================================
CREATE POLICY "All can view grade types" ON grade_types FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah can insert grade types" ON grade_types FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update grade types" ON grade_types FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete grade types" ON grade_types FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- ============================================
-- GRADES
-- ============================================
CREATE POLICY "Authorized users can view grades" ON grades
  FOR SELECT USING (
    get_user_role() = 'kepala_sekolah' OR
    (get_user_role() = 'guru' AND teacher_id = get_profile_id())
  );
CREATE POLICY "Guru can insert grades" ON grades
  FOR INSERT WITH CHECK (
    get_user_role() IN ('guru', 'kepala_sekolah') AND
    teacher_id = get_profile_id()
  );
CREATE POLICY "Guru can update their own grades" ON grades
  FOR UPDATE USING (teacher_id = get_profile_id());

-- ============================================
-- REPORT_CARDS
-- ============================================
CREATE POLICY "All can view report cards" ON report_cards FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah and guru can insert report cards" ON report_cards FOR INSERT WITH CHECK (get_user_role() IN ('kepala_sekolah', 'guru'));
CREATE POLICY "Kepala sekolah and guru can update report cards" ON report_cards FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'guru'));
CREATE POLICY "Kepala sekolah and guru can delete report cards" ON report_cards FOR DELETE USING (get_user_role() IN ('kepala_sekolah', 'guru'));

-- ============================================
-- ACADEMIC_EVENTS
-- ============================================
CREATE POLICY "All can view events" ON academic_events FOR SELECT USING (true);
CREATE POLICY "Kepala sekolah can insert events" ON academic_events FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update events" ON academic_events FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete events" ON academic_events FOR DELETE USING (get_user_role() = 'kepala_sekolah');
