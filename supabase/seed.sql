-- Seed Data for Sistem Akademik SD N 2 Kalierang

-- 1. School Years & Semesters
INSERT INTO public.school_years (id, name, start_date, end_date, is_active)
VALUES 
  ('a1b1c1d1-1111-1111-1111-111111111111', '2025/2026', '2025-07-01', '2026-06-30', TRUE);

INSERT INTO public.semesters (id, school_year_id, name, semester_number, start_date, end_date)
VALUES 
  ('s1s1s1s1-1111-1111-1111-111111111111', 'a1b1c1d1-1111-1111-1111-111111111111', 'Ganjil 2025/2026', 1, '2025-07-01', '2025-12-31'),
  ('s2s2s2s2-2222-2222-2222-222222222222', 'a1b1c1d1-1111-1111-1111-111111111111', 'Genap 2025/2026', 2, '2026-01-01', '2026-06-30');

-- 2. Profiles (Teachers & Staff)
-- Note: These should ideally be linked to auth.users.
-- We use fixed UUIDs for seeding purposes.
INSERT INTO public.profiles (id, user_id, full_name, role)
VALUES 
  ('p1p1p1p1-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Budi Santoso, S.Pd.', 'kepala_sekolah'),
  ('p2p2p2p2-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Siti Aminah, S.Pd.', 'guru'),
  ('p3p3p3p3-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 'Ahmad Fauzi, S.Pd.', 'guru'),
  ('p4p4p4p4-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000004', 'Ani Wijaya, A.Md.', 'tata_usaha');

-- 3. Classes
INSERT INTO public.classes (id, name, grade_level, school_year_id, homeroom_teacher_id)
VALUES 
  ('c1c1c1c1-1111-1111-1111-111111111111', 'Kelas 1A', 1, 'a1b1c1d1-1111-1111-1111-111111111111', 'p2p2p2p2-2222-2222-2222-222222222222'),
  ('c2c2c2c2-2222-2222-2222-222222222222', 'Kelas 2A', 2, 'a1b1c1d1-1111-1111-1111-111111111111', 'p3p3p3p3-3333-3333-3333-333333333333');

-- 4. Subjects
INSERT INTO public.subjects (id, name, code, grade_level)
VALUES 
  ('sub1-111', 'Matematika', 'MAT-1', 1),
  ('sub2-111', 'Bahasa Indonesia', 'BIN-1', 1),
  ('sub3-111', 'IPA', 'IPA-1', 1),
  ('sub1-222', 'Matematika', 'MAT-2', 2),
  ('sub2-222', 'Bahasa Indonesia', 'BIN-2', 2);

-- 5. Teacher Subjects Mapping
INSERT INTO public.teacher_subjects (teacher_id, subject_id, class_id, semester_id)
VALUES 
  ('p2p2p2p2-2222-2222-2222-222222222222', 'sub1-111', 'c1c1c1c1-1111-1111-1111-111111111111', 's1s1s1s1-1111-1111-1111-111111111111'),
  ('p2p2p2p2-2222-2222-2222-222222222222', 'sub2-111', 'c1c1c1c1-1111-1111-1111-111111111111', 's1s1s1s1-1111-1111-1111-111111111111'),
  ('p3p3p3p3-3333-3333-3333-333333333333', 'sub1-222', 'c2c2c2c2-2222-2222-2222-222222222222', 's1s1s1s1-1111-1111-1111-111111111111');

-- 6. Students
INSERT INTO public.students (id, nis, full_name, nickname, gender, birth_date, birth_place, religion, address, parent_name, status)
VALUES 
  ('st1-111', '2024001', 'Aditya Pratama', 'Adit', 'L', '2017-05-12', 'Banjarnegara', 'Islam', 'Jl. Kalierang No. 1', 'Bambang', 'aktif'),
  ('st2-222', '2024002', 'Bella Safira', 'Bella', 'P', '2017-08-20', 'Banjarnegara', 'Islam', 'Jl. Kalierang No. 5', 'Susi', 'aktif'),
  ('st3-333', '2023001', 'Candra Wijaya', 'Candra', 'L', '2016-02-15', 'Banjarnegara', 'Islam', 'Jl. Kalierang No. 10', 'Dedi', 'aktif');

-- 7. Student Enrollments
INSERT INTO public.student_enrollments (student_id, class_id, school_year_id, status)
VALUES 
  ('st1-111', 'c1c1c1c1-1111-1111-1111-111111111111', 'a1b1c1d1-1111-1111-1111-111111111111', 'aktif'),
  ('st2-222', 'c1c1c1c1-1111-1111-1111-111111111111', 'a1b1c1d1-1111-1111-1111-111111111111', 'aktif'),
  ('st3-333', 'c2c2c2c2-2222-2222-2222-222222222222', 'a1b1c1d1-1111-1111-1111-111111111111', 'aktif');

-- 8. Grade Types
INSERT INTO public.grade_types (name, code, weight)
VALUES 
  ('Ulangan Harian', 'UH', 30),
  ('Tugas', 'tugas', 20),
  ('UTS', 'UTS', 25),
  ('UAS', 'UAS', 25);

-- 9. Academic Events
INSERT INTO public.academic_events (title, description, event_type, start_date, end_date, created_by)
VALUES 
  ('Pembagian Rapor Ganjil', 'Pembagian rapor semester ganjil kepada orang tua siswa', 'kegiatan', '2025-12-20', '2025-12-20', 'p1p1p1p1-1111-1111-1111-111111111111'),
  ('Libur Semester Ganjil', 'Libur akhir semester ganjil', 'libur', '2025-12-21', '2026-01-02', 'p1p1p1p1-1111-1111-1111-111111111111');

-- 10. Sample Attendance
INSERT INTO public.attendances (student_id, class_id, date, status)
VALUES 
  ('st1-111', 'c1c1c1c1-1111-1111-1111-111111111111', CURRENT_DATE, 'hadir'),
  ('st2-222', 'c1c1c1c1-1111-1111-1111-111111111111', CURRENT_DATE, 'hadir');
