-- Add indexes for foreign keys to improve query performance
-- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

-- Academic Events
CREATE INDEX IF NOT EXISTS idx_academic_events_created_by ON public.academic_events(created_by);

-- Attendances
CREATE INDEX IF NOT EXISTS idx_attendances_class_id ON public.attendances(class_id);
CREATE INDEX IF NOT EXISTS idx_attendances_recorded_by ON public.attendances(recorded_by);

-- Classes
CREATE INDEX IF NOT EXISTS idx_classes_homeroom_teacher_id ON public.classes(homeroom_teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_year_id ON public.classes(school_year_id);

-- Grades
CREATE INDEX IF NOT EXISTS idx_grades_grade_type_id ON public.grades(grade_type_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON public.grades(teacher_id);

-- Report Cards
CREATE INDEX IF NOT EXISTS idx_report_cards_semester_id ON public.report_cards(semester_id);

-- Semesters
CREATE INDEX IF NOT EXISTS idx_semesters_school_year_id ON public.semesters(school_year_id);

-- Teacher Subjects
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_class_id ON public.teacher_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_semester_id ON public.teacher_subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject_id ON public.teacher_subjects(subject_id);
