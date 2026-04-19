-- ============================================
-- Large Seed Data for SD N 2 Kalierang
-- ============================================

DO $$
DECLARE
    sys_year_id UUID;
    sem1_id UUID;
    cls_id UUID;
    std_id UUID;
    teacher_id UUID;
    sub_id UUID;
    grade_type_uh UUID;
    grade_type_uts UUID;
    grade_type_uas UUID;
    i INT;
    j INT;
    k INT;
    day_offset INT;
    current_date_val DATE;
    first_names TEXT[] := ARRAY['Budi', 'Siti', 'Agus', 'Lani', 'Eko', 'Rini', 'Dedi', 'Maya', 'Ahmad', 'Dewi', 'Joko', 'Ani', 'Hendra', 'Siska', 'Bambang', 'Putri', 'Taufik', 'Ratna', 'Rian', 'Indah'];
    last_names TEXT[] := ARRAY['Santoso', 'Wijaya', 'Saputra', 'Lestari', 'Kusuma', 'Pratiwi', 'Hidayat', 'Utami', 'Setiawan', 'Permata', 'Gunawan', 'Sari', 'Mulyono', 'Fitriani', 'Ramadhan', 'Aulia', 'Nugroho', 'Wulandari', 'Prasetyo', 'Rahayu'];
BEGIN
    -- 1. Create School Year and Semester if not exists
    INSERT INTO school_years (name, start_date, end_date, is_active)
    VALUES ('2025/2026', '2025-07-01', '2026-06-30', TRUE)
    ON CONFLICT DO NOTHING
    RETURNING id INTO sys_year_id;

    IF sys_year_id IS NULL THEN
        SELECT id INTO sys_year_id FROM school_years WHERE name = '2025/2026';
    END IF;

    INSERT INTO semesters (school_year_id, name, semester_number, start_date, end_date)
    VALUES (sys_year_id, 'Ganjil', 1, '2025-07-01', '2025-12-31')
    ON CONFLICT DO NOTHING
    RETURNING id INTO sem1_id;

    IF sem1_id IS NULL THEN
        SELECT id INTO sem1_id FROM semesters WHERE name = 'Ganjil' AND school_year_id = sys_year_id;
    END IF;

    -- 2. Create Grade Types
    INSERT INTO grade_types (name, code, weight_percentage)
    VALUES ('Ulangan Harian', 'UH', 30),
           ('UTS', 'UTS', 30),
           ('UAS', 'UAS', 40)
    ON CONFLICT (code) DO NOTHING;

    SELECT id INTO grade_type_uh FROM grade_types WHERE code = 'UH';
    SELECT id INTO grade_type_uts FROM grade_types WHERE code = 'UTS';
    SELECT id INTO grade_type_uas FROM grade_types WHERE code = 'UAS';

    -- 3. Create Teachers, Classes, Subjects, and Students
    FOR i IN 1..6 LOOP
        -- Create Homeroom Teacher
        -- Note: We assume auth.users handles the actual user, but for demo we just insert into profiles
        -- In a real app, these should be linked to auth.users. 
        -- For this seed, we'll create dummy profiles not linked to users if necessary, 
        -- but the schema has a foreign key to auth.users.
        -- SO, we skip creating NEW profiles here and assume they exist or use existing ones if any.
        -- IF no profiles exist, we might need to create them in auth.users first which is tricky via SQL.
        -- For now, let's assume there are at least 6 profiles we can use.
        
        -- Get a teacher profile
        SELECT id INTO teacher_id FROM profiles WHERE role = 'guru' LIMIT 1 OFFSET (i-1);
        
        -- Fallback if not enough teachers
        IF teacher_id IS NULL THEN
            SELECT id INTO teacher_id FROM profiles WHERE role = 'guru' LIMIT 1;
        END IF;
        
        -- Fallback to any profile if still null
        IF teacher_id IS NULL THEN
            SELECT id INTO teacher_id FROM profiles LIMIT 1;
        END IF;

        -- Create Class
        INSERT INTO classes (name, grade_level, school_year_id, homeroom_teacher_id)
        VALUES ('Kelas ' || i || 'A', i, sys_year_id, teacher_id)
        RETURNING id INTO cls_id;

        -- Create Subjects for this grade
        INSERT INTO subjects (name, code, grade_level)
        VALUES ('Matematika', 'MTK-' || i, i),
               ('Bahasa Indonesia', 'BIN-' || i, i),
               ('IPA', 'IPA-' || i, i),
               ('IPS', 'IPS-' || i, i),
               ('Pancasila', 'PPKN-' || i, i);

        -- Create 20 Students per class
        FOR j IN 1..20 LOOP
            INSERT INTO students (nis, full_name, nickname, gender, birth_date, birth_place, religion, address, parent_name, status)
            VALUES (
                'NIS-' || i || '-' || LPAD(j::text, 3, '0'),
                first_names[(j % 20) + 1] || ' ' || last_names[((i+j) % 20) + 1],
                first_names[(j % 20) + 1],
                CASE WHEN j % 2 = 0 THEN 'L' ELSE 'P' END,
                '201' || (8-i) || '-01-01',
                'Kalierang',
                'Islam',
                'Alamat Siswa ' || j,
                'Orang Tua ' || j,
                'aktif'
            )
            RETURNING id INTO std_id;

            -- Enroll Student
            INSERT INTO student_enrollments (student_id, class_id, school_year_id, status)
            VALUES (std_id, cls_id, sys_year_id, 'aktif');

            -- 4. Create Attendance for this student (Past 30 days for demo)
            IF teacher_id IS NOT NULL THEN
                FOR day_offset IN 0..30 LOOP
                    current_date_val := '2025-11-01'::DATE + day_offset;
                    -- Skip Sundays
                    IF EXTRACT(DOW FROM current_date_val) != 0 THEN
                        INSERT INTO attendances (student_id, class_id, date, status, recorded_by)
                        VALUES (
                            std_id, 
                            cls_id, 
                            current_date_val, 
                            CASE 
                                WHEN random() < 0.9 THEN 'hadir'
                                WHEN random() < 0.95 THEN 'izin'
                                WHEN random() < 0.98 THEN 'sakit'
                                ELSE 'alpha'
                            END,
                            teacher_id
                        ) ON CONFLICT DO NOTHING;
                    END IF;
                END LOOP;
            END IF;

            -- 5. Create Grades for each subject
            FOR sub_id IN (SELECT id FROM subjects WHERE grade_level = i) LOOP
                IF teacher_id IS NOT NULL THEN
                    -- UH
                    INSERT INTO grades (student_id, subject_id, teacher_id, semester_id, grade_type_id, score, date_recorded)
                    VALUES (std_id, sub_id, teacher_id, sem1_id, grade_type_uh, 70 + floor(random() * 30), '2025-09-15');
                    
                    -- UTS
                    INSERT INTO grades (student_id, subject_id, teacher_id, semester_id, grade_type_id, score, date_recorded)
                    VALUES (std_id, sub_id, teacher_id, sem1_id, grade_type_uts, 65 + floor(random() * 35), '2025-10-20');
                    
                    -- UAS
                    INSERT INTO grades (student_id, subject_id, teacher_id, semester_id, grade_type_id, score, date_recorded)
                    VALUES (std_id, sub_id, teacher_id, sem1_id, grade_type_uas, 60 + floor(random() * 40), '2025-12-10');
                END IF;
            END LOOP;

            -- 6. Generate Report Card Summary
            INSERT INTO report_cards (student_id, semester_id, final_grades, attendance_summary, homeroom_notes)
            VALUES (
                std_id, 
                sem1_id, 
                '{"MTK": 85, "BIN": 90, "IPA": 88}', 
                '{"hadir": 28, "sakit": 1, "izin": 1, "alpha": 0}',
                'Pertahankan prestasimu!'
            ) ON CONFLICT DO NOTHING;

        END LOOP;
    END LOOP;
END $$;
