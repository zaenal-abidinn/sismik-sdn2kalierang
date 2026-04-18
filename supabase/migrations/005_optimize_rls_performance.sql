-- Optimize RLS policies for performance and resolve linter warnings
-- 1. Use (select auth.uid()) for better query planning
-- 2. Combine overlapping SELECT policies
-- 3. Avoid multiple permissive policies for the same action

-- Drop old policies to replace them
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Kepala sekolah can manage school years" ON school_years;
DROP POLICY IF EXISTS "Kepala sekolah can manage semesters" ON semesters;
DROP POLICY IF EXISTS "Kepala sekolah can manage classes" ON classes;
DROP POLICY IF EXISTS "Kepala sekolah can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Kepala sekolah can manage teacher subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "Tata usaha and kepala sekolah can manage students" ON students;
DROP POLICY IF EXISTS "Tata usaha and kepala sekolah can manage enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Kepala sekolah can manage grade types" ON grade_types;
DROP POLICY IF EXISTS "Kepala sekolah and guru can manage report cards" ON report_cards;
DROP POLICY IF EXISTS "Kepala sekolah can manage events" ON academic_events;

-- Re-create with optimizations
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (user_id = (select auth.uid()));

-- School Years
CREATE POLICY "Kepala sekolah can insert school years" ON school_years FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update school years" ON school_years FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete school years" ON school_years FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- Semesters
CREATE POLICY "Kepala sekolah can insert semesters" ON semesters FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update semesters" ON semesters FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete semesters" ON semesters FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- Classes
CREATE POLICY "Kepala sekolah can insert classes" ON classes FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update classes" ON classes FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete classes" ON classes FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- Subjects
CREATE POLICY "Kepala sekolah can insert subjects" ON subjects FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update subjects" ON subjects FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete subjects" ON subjects FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- Teacher Subjects
CREATE POLICY "Kepala sekolah can insert teacher subjects" ON teacher_subjects FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update teacher subjects" ON teacher_subjects FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete teacher subjects" ON teacher_subjects FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- Students
CREATE POLICY "Tata usaha and kepala sekolah can insert students" ON students FOR INSERT WITH CHECK (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can update students" ON students FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can delete students" ON students FOR DELETE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));

-- Student Enrollments
CREATE POLICY "Tata usaha and kepala sekolah can insert enrollments" ON student_enrollments FOR INSERT WITH CHECK (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can update enrollments" ON student_enrollments FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));
CREATE POLICY "Tata usaha and kepala sekolah can delete enrollments" ON student_enrollments FOR DELETE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha'));

-- Grade Types
CREATE POLICY "Kepala sekolah can insert grade types" ON grade_types FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update grade types" ON grade_types FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete grade types" ON grade_types FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- Report Cards
CREATE POLICY "Kepala sekolah and guru can insert report cards" ON report_cards FOR INSERT WITH CHECK (get_user_role() IN ('kepala_sekolah', 'guru'));
CREATE POLICY "Kepala sekolah and guru can update report cards" ON report_cards FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'guru'));
CREATE POLICY "Kepala sekolah and guru can delete report cards" ON report_cards FOR DELETE USING (get_user_role() IN ('kepala_sekolah', 'guru'));

-- Events
CREATE POLICY "Kepala sekolah can insert events" ON academic_events FOR INSERT WITH CHECK (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can update events" ON academic_events FOR UPDATE USING (get_user_role() = 'kepala_sekolah');
CREATE POLICY "Kepala sekolah can delete events" ON academic_events FOR DELETE USING (get_user_role() = 'kepala_sekolah');

-- Combined SELECT policies for Attendance and Grades
DROP POLICY IF EXISTS "Authorized users can view attendance" ON attendances;
CREATE POLICY "Authorized users can view attendance" ON attendances
  FOR SELECT USING (
    get_user_role() = 'kepala_sekolah' OR
    (get_user_role() = 'guru' AND class_id IN (
      SELECT id FROM classes WHERE homeroom_teacher_id = get_profile_id()
    ))
  );

DROP POLICY IF EXISTS "Authorized users can view grades" ON grades;
CREATE POLICY "Authorized users can view grades" ON grades
  FOR SELECT USING (
    get_user_role() = 'kepala_sekolah' OR
    (get_user_role() = 'guru' AND teacher_id = get_profile_id())
  );
