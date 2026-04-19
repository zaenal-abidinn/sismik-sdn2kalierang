-- ============================================
-- Add Schedules Table and Refine Student Data
-- ============================================

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1: Monday, ..., 7: Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, day_of_week, start_time, semester_id)
);

-- Index for schedules
CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);

-- Add helper view for student with their current class
DROP VIEW IF EXISTS student_details;
CREATE OR REPLACE VIEW student_details 
WITH (security_invoker = true)
AS
SELECT 
    s.*,
    c.id as class_id,
    c.name as class_name,
    c.grade_level,
    sy.name as school_year_name
FROM students s
LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.status = 'aktif'
LEFT JOIN classes c ON se.class_id = c.id
LEFT JOIN school_years sy ON se.school_year_id = sy.id;
