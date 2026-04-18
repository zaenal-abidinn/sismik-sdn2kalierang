-- ============================================
-- Seed: Grade Types
-- ============================================
INSERT INTO grade_types (name, code, weight_percentage) VALUES
  ('Ulangan Harian', 'UH', 20),
  ('Ujian Tengah Semester', 'UTS', 25),
  ('Ujian Akhir Semester', 'UAS', 30),
  ('Tugas', 'tugas', 15),
  ('Praktik', 'praktik', 10)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Seed: Active School Year
-- ============================================
INSERT INTO school_years (id, name, start_date, end_date, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025/2026', '2025-07-14', '2026-06-20', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed: Semesters
-- ============================================
INSERT INTO semesters (school_year_id, name, semester_number, start_date, end_date) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Semester 1', 1, '2025-07-14', '2025-12-20'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Semester 2', 2, '2026-01-05', '2026-06-20')
ON CONFLICT DO NOTHING;
