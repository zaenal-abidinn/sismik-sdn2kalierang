-- Migration: Fix Delete Policies for Guru
-- Allow Guru to delete their own grade records
DROP POLICY IF EXISTS "Guru can delete their own grades" ON grades;
CREATE POLICY "Guru can delete their own grades" ON grades
  FOR DELETE USING (
    get_user_role() IN ('guru', 'kepala_sekolah') AND
    teacher_id = get_profile_id()
  );

-- Allow Guru to delete their own attendance records
DROP POLICY IF EXISTS "Guru can delete their own attendances" ON attendances;
CREATE POLICY "Guru can delete their own attendances" ON attendances
  FOR DELETE USING (
    get_user_role() IN ('guru', 'kepala_sekolah') AND
    recorded_by = get_profile_id()
  );
