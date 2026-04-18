-- Seed Data for Sistem Akademik SD N 2 Kalierang
-- This migration populates the database with initial academic data

-- 1. Create dummy users in auth.users
INSERT INTO auth.users (id, email, aud, role, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
  ('00000000-0000-4000-a000-000000000001', 'kepala@sekolah.id', 'authenticated', 'authenticated', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Budi Santoso","role":"kepala_sekolah"}'),
  ('00000000-0000-4000-a000-000000000002', 'guru1@sekolah.id', 'authenticated', 'authenticated', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Siti Aminah","role":"guru"}'),
  ('00000000-0000-4000-a000-000000000003', 'guru2@sekolah.id', 'authenticated', 'authenticated', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmad Fauzi","role":"guru"}'),
  ('00000000-0000-4000-a000-000000000004', 'tu@sekolah.id', 'authenticated', 'authenticated', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ani Wijaya","role":"tata_usaha"}')
ON CONFLICT (id) DO NOTHING;

-- 2. Update the profiles created by the trigger
INSERT INTO public.profiles (id, user_id, full_name, role)
VALUES 
  ('f1f1f1f1-1111-4111-a111-111111111111', '00000000-0000-4000-a000-000000000001', 'Budi Santoso, S.Pd.', 'kepala_sekolah'),
  ('f2f2f2f2-2222-4222-a222-222222222222', '00000000-0000-4000-a000-000000000002', 'Siti Aminah, S.Pd.', 'guru'),
  ('f3f3f3f3-3333-4333-a333-333333333333', '00000000-0000-4000-a000-000000000003', 'Ahmad Fauzi, S.Pd.', 'guru'),
  ('f4f4f4f4-4444-4444-a444-444444444444', '00000000-0000-4000-a000-000000000004', 'Ani Wijaya, A.Md.', 'tata_usaha')
ON CONFLICT (user_id) DO UPDATE SET 
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 3. School Years & Semesters
INSERT INTO public.school_years (id, name, start_date, end_date, is_active)
VALUES 
  ('a1b1c1d1-1111-4111-a111-111111111111', '2025/2026', '2025-07-01', '2026-06-30', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.semesters (id, school_year_id, name, semester_number, start_date, end_date)
VALUES 
  ('e1e1e1e1-1111-4111-a111-111111111111', 'a1b1c1d1-1111-4111-a111-111111111111', 'Ganjil 2025/2026', 1, '2025-07-01', '2025-12-31'),
  ('e2e2e2e2-2222-4222-a222-222222222222', 'a1b1c1d1-1111-4111-a111-111111111111', 'Genap 2025/2026', 2, '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;

-- 4. Classes
INSERT INTO public.classes (id, name, grade_level, school_year_id, homeroom_teacher_id)
VALUES 
  ('c1c1c1c1-1111-4111-a111-111111111111', 'Kelas 1A', 1, 'a1b1c1d1-1111-4111-a111-111111111111', 'f2f2f2f2-2222-4222-a222-222222222222'),
  ('c2c2c2c2-2222-4222-a222-222222222222', 'Kelas 2A', 2, 'a1b1c1d1-1111-4111-a111-111111111111', 'f3f3f3f3-3333-4333-a333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- 5. Subjects
INSERT INTO public.subjects (id, name, code, grade_level)
VALUES 
  ('b1b1b1b1-1111-4111-a111-111111111111', 'Matematika', 'MAT-1', 1),
  ('b2b2b2b2-2222-4222-a222-222222222222', 'Bahasa Indonesia', 'BIN-1', 1),
  ('b3b3b3b3-3333-4333-a333-333333333333', 'IPA', 'IPA-1', 1),
  ('b1b1b1b1-2222-4222-a222-222222222222', 'Matematika', 'MAT-2', 2),
  ('b2b2b2b2-3333-4333-a333-333333333333', 'Bahasa Indonesia', 'BIN-2', 2)
ON CONFLICT (id) DO NOTHING;

-- 6. Teacher Subjects Mapping
INSERT INTO public.teacher_subjects (teacher_id, subject_id, class_id, semester_id)
VALUES 
  ('f2f2f2f2-2222-4222-a222-222222222222', 'b1b1b1b1-1111-4111-a111-111111111111', 'c1c1c1c1-1111-4111-a111-111111111111', 'e1e1e1e1-1111-4111-a111-111111111111'),
  ('f2f2f2f2-2222-4222-a222-222222222222', 'b2b2b2b2-2222-4222-a222-222222222222', 'c1c1c1c1-1111-4111-a111-111111111111', 'e1e1e1e1-1111-4111-a111-111111111111'),
  ('f3f3f3f3-3333-4333-a333-333333333333', 'b1b1b1b1-2222-4222-a222-222222222222', 'c2c2c2c2-2222-4222-a222-222222222222', 'e1e1e1e1-1111-4111-a111-111111111111')
ON CONFLICT DO NOTHING;

-- 7. Students
INSERT INTO public.students (id, nis, full_name, nickname, gender, birth_date, birth_place, religion, address, parent_name, status)
VALUES 
  ('d1d1d1d1-1111-4111-a111-111111111111', '2024001', 'Aditya Pratama', 'Adit', 'L', '2017-05-12', 'Banjarnegara', 'Islam', 'Jl. Kalierang No. 1', 'Bambang', 'aktif'),
  ('d2d2d2d2-2222-4222-a222-222222222222', '2024002', 'Bella Safira', 'Bella', 'P', '2017-08-20', 'Banjarnegara', 'Islam', 'Jl. Kalierang No. 5', 'Susi', 'aktif'),
  ('d3d3d3d3-3333-4333-a333-333333333333', '2023001', 'Candra Wijaya', 'Candra', 'L', '2016-02-15', 'Banjarnegara', 'Islam', 'Jl. Kalierang No. 10', 'Dedi', 'aktif')
ON CONFLICT (id) DO NOTHING;

-- 8. Student Enrollments
INSERT INTO public.student_enrollments (student_id, class_id, school_year_id, status)
VALUES 
  ('d1d1d1d1-1111-4111-a111-111111111111', 'c1c1c1c1-1111-4111-a111-111111111111', 'a1b1c1d1-1111-4111-a111-111111111111', 'aktif'),
  ('d2d2d2d2-2222-4222-a222-222222222222', 'c1c1c1c1-1111-4111-a111-111111111111', 'a1b1c1d1-1111-4111-a111-111111111111', 'aktif'),
  ('d3d3d3d3-3333-4333-a333-333333333333', 'c2c2c2c2-2222-4222-a222-222222222222', 'a1b1c1d1-1111-4111-a111-111111111111', 'aktif')
ON CONFLICT (id) DO NOTHING;

-- 9. Grade Types
INSERT INTO public.grade_types (name, code, weight_percentage)
VALUES 
  ('Ulangan Harian', 'UH', 30),
  ('Tugas', 'tugas', 20),
  ('UTS', 'UTS', 25),
  ('UAS', 'UAS', 25)
ON CONFLICT (code) DO NOTHING;

-- 10. Academic Events
INSERT INTO public.academic_events (title, description, event_type, start_date, end_date, created_by)
VALUES 
  ('Pembagian Rapor Ganjil', 'Pembagian rapor semester ganjil kepada orang tua siswa', 'kegiatan', '2025-12-20', '2025-12-20', 'f1f1f1f1-1111-4111-a111-111111111111'),
  ('Libur Semester Ganjil', 'Libur akhir semester ganjil', 'libur', '2025-12-21', '2026-01-02', 'f1f1f1f1-1111-4111-a111-111111111111')
ON CONFLICT DO NOTHING;
