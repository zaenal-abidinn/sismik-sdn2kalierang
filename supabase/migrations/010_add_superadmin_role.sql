-- Add 'superadmin' role to user_role ENUM and adjust RLS policies
-- 1. Add 'superadmin' to the enum type
-- Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction block with other commands in some PG versions.
-- We'll do it in a separate DO block if needed, but normally ALTER TYPE is fine.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 2. Update RLS policies to include superadmin in all permissions
-- We'll use a new migration to update all tables

-- Profiles: Superadmin can manage all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Superadmin can manage all profiles" ON profiles;
CREATE POLICY "Superadmin can manage all profiles" ON profiles
  FOR ALL USING (get_user_role() = 'superadmin');

-- School Years, Semesters, Classes, Subjects, Teacher Subjects
-- Managed by superadmin and kepala_sekolah
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('school_years', 'semesters', 'classes', 'subjects', 'teacher_subjects', 'grade_types', 'academic_events')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmin manage %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Superadmin manage %I" ON %I FOR ALL USING (get_user_role() = ''superadmin'')', t, t);
    END LOOP;
END $$;

-- Students and Enrollments
-- Managed by superadmin and tata_usaha
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('students', 'student_enrollments')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmin manage %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Superadmin manage %I" ON %I FOR ALL USING (get_user_role() = ''superadmin'')', t, t);
    END LOOP;
END $$;

-- Attendances and Grades
-- Superadmin can do everything
DROP POLICY IF EXISTS "Superadmin manage attendances" ON attendances;
CREATE POLICY "Superadmin manage attendances" ON attendances FOR ALL USING (get_user_role() = 'superadmin');

DROP POLICY IF EXISTS "Superadmin manage grades" ON grades;
CREATE POLICY "Superadmin manage grades" ON grades FOR ALL USING (get_user_role() = 'superadmin');

-- Report Cards
DROP POLICY IF EXISTS "Superadmin manage report_cards" ON report_cards;
CREATE POLICY "Superadmin manage report_cards" ON report_cards FOR ALL USING (get_user_role() = 'superadmin');
