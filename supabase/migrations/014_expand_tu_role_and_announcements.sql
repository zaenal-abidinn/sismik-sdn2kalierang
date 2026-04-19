-- Migration: Expand Tata Usaha Role and Add Announcements
-- 1. Profiles: allow Tata Usaha and Kepala Sekolah to manage other profiles (teachers)
DROP POLICY IF EXISTS "Tata usaha and kepsek can manage profiles" ON profiles;
CREATE POLICY "Tata usaha and kepsek can manage profiles" ON profiles
  FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'tata_usaha', 'superadmin'));

-- 2. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT CHECK (target_role IN ('semua', 'guru', 'siswa')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 3. Announcements Policies
CREATE POLICY "Announcements are viewable by everyone" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Authorized roles can manage announcements" ON announcements
  FOR ALL USING (get_user_role() IN ('superadmin', 'kepala_sekolah', 'tata_usaha'));

-- 4. Academic Events: allow TU to manage too
DROP POLICY IF EXISTS "Tata usaha can manage academic events" ON academic_events;
CREATE POLICY "Tata usaha can manage academic events" ON academic_events
  FOR ALL USING (get_user_role() IN ('superadmin', 'kepala_sekolah', 'tata_usaha'));
