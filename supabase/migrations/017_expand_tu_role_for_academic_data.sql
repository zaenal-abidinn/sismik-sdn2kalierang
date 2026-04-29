-- Migration: Expand Tata Usaha Role for Academic Data (Subjects, Classes, Teacher Subjects)

-- 1. Subjects
DROP POLICY IF EXISTS "Tata usaha can manage subjects" ON subjects;
CREATE POLICY "Tata usaha can manage subjects" ON subjects 
  FOR ALL 
  USING (get_user_role() = 'tata_usaha')
  WITH CHECK (get_user_role() = 'tata_usaha');

-- 2. Teacher Subjects
DROP POLICY IF EXISTS "Tata usaha can manage teacher subjects" ON teacher_subjects;
CREATE POLICY "Tata usaha can manage teacher subjects" ON teacher_subjects 
  FOR ALL 
  USING (get_user_role() = 'tata_usaha')
  WITH CHECK (get_user_role() = 'tata_usaha');

-- 3. Classes
DROP POLICY IF EXISTS "Tata usaha can manage classes" ON classes;
CREATE POLICY "Tata usaha can manage classes" ON classes 
  FOR ALL 
  USING (get_user_role() = 'tata_usaha')
  WITH CHECK (get_user_role() = 'tata_usaha');
