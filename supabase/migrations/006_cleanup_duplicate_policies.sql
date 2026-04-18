-- Cleanup duplicate permissive policies to resolve performance warnings
-- These were replaced by "Authorized users can view..." in migration 005

DROP POLICY IF EXISTS "Guru can view attendance of their classes" ON attendances;
DROP POLICY IF EXISTS "Kepala sekolah can view all attendance" ON attendances;
DROP POLICY IF EXISTS "Guru can view grades they recorded" ON grades;
DROP POLICY IF EXISTS "Kepala sekolah can view all grades" ON grades;
