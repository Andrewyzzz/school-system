-- 双周循环课表：支持 0.5 节课程与另一门 x.5 节课程在同一课位隔周轮换。
-- 原字段为 integer，无法保留 0.5；升级为一位小数以兼容既有整数字段。
ALTER TABLE grade_course_rules
  ALTER COLUMN weekly_lessons TYPE numeric(5,1)
  USING weekly_lessons::numeric(5,1);

CREATE TABLE IF NOT EXISTS grade_course_cycle_pairs (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  odd_subject_id text NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  even_subject_id text NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT grade_course_cycle_pairs_different_subjects CHECK (odd_subject_id <> even_subject_id),
  UNIQUE (term_id, grade_id, odd_subject_id),
  UNIQUE (term_id, grade_id, even_subject_id)
);

CREATE INDEX IF NOT EXISTS idx_grade_course_cycle_pairs_scope
  ON grade_course_cycle_pairs(term_id, stage_id, grade_id);
