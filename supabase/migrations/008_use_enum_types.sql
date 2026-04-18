-- Convert various TEXT columns with CHECK constraints to PostgreSQL ENUM types
-- This improves type safety and data integrity

-- 1. Create ENUM types
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('kepala_sekolah', 'guru', 'tata_usaha');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.gender_type AS ENUM ('L', 'P');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.student_status AS ENUM ('aktif', 'pindah', 'lulus', 'keluar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.attendance_status AS ENUM ('hadir', 'sakit', 'izin', 'alpha');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.event_type AS ENUM ('libur', 'ujian', 'kegiatan', 'rapat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE public.user_role 
  USING role::public.user_role;

-- 3. Update students table
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_gender_check;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_status_check;

ALTER TABLE public.students ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.students 
  ALTER COLUMN gender TYPE public.gender_type 
  USING gender::public.gender_type;

ALTER TABLE public.students 
  ALTER COLUMN status TYPE public.student_status 
  USING status::public.student_status;

ALTER TABLE public.students ALTER COLUMN status SET DEFAULT 'aktif'::public.student_status;

-- 4. Update attendances table
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS attendances_status_check;

ALTER TABLE public.attendances 
  ALTER COLUMN status TYPE public.attendance_status 
  USING status::public.attendance_status;

-- 5. Update academic_events table
ALTER TABLE public.academic_events DROP CONSTRAINT IF EXISTS academic_events_event_type_check;

ALTER TABLE public.academic_events 
  ALTER COLUMN event_type TYPE public.event_type 
  USING event_type::public.event_type;

-- 6. Update helper functions
-- Keep return type as TEXT to avoid breaking policies that depend on it
-- but cast internal value to TEXT
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE user_id = (select auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
