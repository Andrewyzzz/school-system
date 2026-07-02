-- Phase 1 production schema for PostgreSQL.
-- Scope: teacher accounts, term-based scheduling, attendance, payroll, notifications, and audit logs.
-- This migration keeps source IDs as text so current JSON data can be imported without remapping.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  description text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academic_terms (
  id text PRIMARY KEY,
  name text NOT NULL,
  school_year text NOT NULL,
  semester text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  settlement_month char(7),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'archived')),
  is_current boolean NOT NULL DEFAULT false,
  copied_from_term_id text REFERENCES academic_terms(id) ON DELETE SET NULL,
  copied_config_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_account_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT academic_terms_date_range CHECK (start_date <= end_date),
  CONSTRAINT academic_terms_settlement_month_format CHECK (settlement_month IS NULL OR settlement_month ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_academic_terms_current
  ON academic_terms (is_current)
  WHERE is_current = true;

CREATE TABLE IF NOT EXISTS school_stages (
  id text PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS grades (
  id text PRIMARY KEY,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_no integer NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  UNIQUE (stage_id, grade_no)
);

CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'regular',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS classes (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  class_no integer NOT NULL,
  name text NOT NULL,
  class_type text NOT NULL DEFAULT 'regular' CHECK (class_type IN ('regular', 'experimental', 'international', 'temporary')),
  student_count integer NOT NULL DEFAULT 0 CHECK (student_count >= 0),
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (term_id, grade_id, class_no)
);

CREATE TABLE IF NOT EXISTS room_resource_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity >= 1),
  allow_parallel boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  term_id text REFERENCES academic_terms(id) ON DELETE CASCADE,
  stage_id text REFERENCES school_stages(id) ON DELETE SET NULL,
  grade_id text REFERENCES grades(id) ON DELETE SET NULL,
  room_type_id text REFERENCES room_resource_types(id) ON DELETE SET NULL,
  name text NOT NULL,
  display_key text,
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity >= 1),
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_rooms_display_key
  ON rooms(display_key)
  WHERE display_key IS NOT NULL AND display_key <> '';

CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY,
  username text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'finance', 'admin', 'system_admin', 'classroom')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  teacher_id text,
  name text NOT NULL,
  phone text,
  last_login_at timestamptz,
  password_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_accounts_username ON accounts(username);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_accounts_teacher_id
  ON accounts(teacher_id)
  WHERE teacher_id IS NOT NULL AND teacher_id <> '';

CREATE TABLE IF NOT EXISTS teachers (
  id text PRIMARY KEY,
  employee_no text NOT NULL,
  name text NOT NULL,
  stage_id text REFERENCES school_stages(id) ON DELETE SET NULL,
  grade_id text REFERENCES grades(id) ON DELETE SET NULL,
  primary_subject_id text REFERENCES subjects(id) ON DELETE SET NULL,
  department text,
  phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'left')),
  hire_date date,
  leave_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_no)
);

ALTER TABLE accounts
  ADD CONSTRAINT fk_accounts_teacher
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_teachers_stage_grade_subject
  ON teachers(stage_id, grade_id, primary_subject_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_teachers_name_search
  ON teachers USING gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(employee_no, '') || ' ' || coalesce(phone, '')));

CREATE TABLE IF NOT EXISTS teacher_salary_profiles (
  id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  term_id text REFERENCES academic_terms(id) ON DELETE SET NULL,
  effective_month char(7),
  qualification_level text,
  assessment_level text,
  seniority_years integer NOT NULL DEFAULT 0 CHECK (seniority_years >= 0),
  housing_level text,
  role_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  supplemental_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  manual_adjustments jsonb NOT NULL DEFAULT '[]'::jsonb,
  trial_ratio numeric(5, 4) NOT NULL DEFAULT 1 CHECK (trial_ratio >= 0 AND trial_ratio <= 1),
  is_default boolean NOT NULL DEFAULT false,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT salary_profile_month_format CHECK (effective_month IS NULL OR effective_month ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_teacher_salary_default_per_term
  ON teacher_salary_profiles(teacher_id, term_id)
  WHERE is_default = true;

CREATE TABLE IF NOT EXISTS payroll_rules (
  id text PRIMARY KEY,
  version text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  rules jsonb NOT NULL,
  effective_from date,
  effective_to date,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_payroll_rules_active
  ON payroll_rules(status)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS grade_course_rules (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  weekly_lessons integer NOT NULL DEFAULT 0 CHECK (weekly_lessons >= 0),
  duration_minutes integer NOT NULL DEFAULT 40 CHECK (duration_minutes > 0),
  min_per_day integer NOT NULL DEFAULT 0 CHECK (min_per_day >= 0),
  max_per_day integer NOT NULL DEFAULT 0 CHECK (max_per_day >= 0),
  max_consecutive integer NOT NULL DEFAULT 0 CHECK (max_consecutive >= 0),
  banned_periods integer[] NOT NULL DEFAULT '{}',
  preferred_time text NOT NULL DEFAULT 'any' CHECK (preferred_time IN ('any', 'morning', 'afternoon')),
  room_type_id text REFERENCES room_resource_types(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (term_id, grade_id, subject_id)
);

CREATE TABLE IF NOT EXISTS class_teacher_assignments (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  active boolean NOT NULL DEFAULT true,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (term_id, class_id, subject_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_class_teacher_assignments_teacher
  ON class_teacher_assignments(term_id, teacher_id)
  WHERE active = true;

CREATE TABLE IF NOT EXISTS schedule_period_templates (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  period_no integer NOT NULL CHECK (period_no > 0),
  start_time time NOT NULL,
  end_time time NOT NULL,
  period_type text NOT NULL DEFAULT 'regular' CHECK (period_type IN ('regular', 'self_study', 'activity', 'evening_study')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (term_id, grade_id, period_no),
  CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS schedule_constraints (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  subject_id text REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id text REFERENCES teachers(id) ON DELETE CASCADE,
  class_id text REFERENCES classes(id) ON DELETE CASCADE,
  constraint_type text NOT NULL,
  hard boolean NOT NULL DEFAULT true,
  rule jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_constraints_scope
  ON schedule_constraints(term_id, stage_id, grade_id, constraint_type)
  WHERE active = true;

CREATE TABLE IF NOT EXISTS teacher_schedule_rules (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  unavailable_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  max_weekly_lessons integer NOT NULL DEFAULT 20 CHECK (max_weekly_lessons >= 0),
  active boolean NOT NULL DEFAULT true,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (term_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS schedule_drafts (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  week_start date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  version_no integer NOT NULL DEFAULT 1,
  solver_status text,
  quality_score numeric(5, 2),
  conflicts jsonb NOT NULL DEFAULT '[]'::jsonb,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_drafts_scope
  ON schedule_drafts(term_id, stage_id, grade_id, week_start, status);

CREATE TABLE IF NOT EXISTS schedule_draft_assignments (
  id text PRIMARY KEY,
  draft_id text NOT NULL REFERENCES schedule_drafts(id) ON DELETE CASCADE,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  room_id text REFERENCES rooms(id) ON DELETE SET NULL,
  lesson_date date NOT NULL,
  period_no integer NOT NULL CHECK (period_no > 0),
  start_time time NOT NULL,
  end_time time NOT NULL,
  lesson_type text NOT NULL DEFAULT 'regular',
  units numeric(8, 2) NOT NULL DEFAULT 1 CHECK (units >= 0),
  locked boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_schedule_draft_assignments_draft
  ON schedule_draft_assignments(draft_id, lesson_date, period_no);

CREATE TABLE IF NOT EXISTS schedule_versions (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  draft_id text REFERENCES schedule_drafts(id) ON DELETE SET NULL,
  stage_id text NOT NULL REFERENCES school_stages(id) ON DELETE RESTRICT,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  version_no integer NOT NULL,
  week_start date NOT NULL,
  published_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  UNIQUE (term_id, grade_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_schedule_versions_scope
  ON schedule_versions(term_id, stage_id, grade_id, week_start, active);

CREATE TABLE IF NOT EXISTS lesson_instances (
  id text PRIMARY KEY,
  term_id text NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  schedule_version_id text REFERENCES schedule_versions(id) ON DELETE SET NULL,
  draft_assignment_id text REFERENCES schedule_draft_assignments(id) ON DELETE SET NULL,
  class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  room_id text REFERENCES rooms(id) ON DELETE SET NULL,
  lesson_date date NOT NULL,
  period_no integer NOT NULL CHECK (period_no > 0),
  start_time time NOT NULL,
  end_time time NOT NULL,
  class_name text NOT NULL,
  subject_name text NOT NULL,
  teacher_name text NOT NULL,
  room_name text,
  lesson_type text NOT NULL DEFAULT 'regular',
  units numeric(8, 2) NOT NULL DEFAULT 1 CHECK (units >= 0),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending', 'checked_in', 'completed', 'exception', 'cancelled')),
  check_in_at timestamptz,
  check_out_at timestamptz,
  attendance_note text,
  source text NOT NULL DEFAULT 'backend-scheduling',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_lesson_instances_teacher_month
  ON lesson_instances(teacher_id, lesson_date);

CREATE INDEX IF NOT EXISTS idx_lesson_instances_class_week
  ON lesson_instances(class_id, lesson_date);

CREATE INDEX IF NOT EXISTS idx_lesson_instances_room_week
  ON lesson_instances(room_id, lesson_date);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_lesson_teacher_slot
  ON lesson_instances(term_id, teacher_id, lesson_date, period_no)
  WHERE status <> 'cancelled';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_lesson_class_slot
  ON lesson_instances(term_id, class_id, lesson_date, period_no)
  WHERE status <> 'cancelled';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_lesson_room_slot
  ON lesson_instances(term_id, room_id, lesson_date, period_no)
  WHERE status <> 'cancelled' AND room_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS classroom_qr_tokens (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  display_key text NOT NULL,
  token_hash text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_classroom_qr_tokens_room_expires
  ON classroom_qr_tokens(room_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS attendance_records (
  id text PRIMARY KEY,
  lesson_id text REFERENCES lesson_instances(id) ON DELETE SET NULL,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  room_id text REFERENCES rooms(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('check_in', 'check_out')),
  status text NOT NULL CHECK (status IN ('accepted', 'rejected', 'exception')),
  scanned_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'qr',
  qr_token_id text REFERENCES classroom_qr_tokens(id) ON DELETE SET NULL,
  result_code text NOT NULL,
  result_text text NOT NULL,
  device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_teacher_time
  ON attendance_records(teacher_id, scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_lesson
  ON attendance_records(lesson_id, action, status);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_accepted_attendance_lesson_action
  ON attendance_records(lesson_id, action)
  WHERE status = 'accepted' AND lesson_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS workload_confirmations (
  id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  term_id text REFERENCES academic_terms(id) ON DELETE SET NULL,
  month char(7) NOT NULL,
  status text NOT NULL DEFAULT 'unconfirmed' CHECK (status IN ('unconfirmed', 'teacher_confirmed', 'locked')),
  stage integer NOT NULL DEFAULT 0 CHECK (stage >= 0),
  summary_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  line_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  confirmed_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, month),
  CHECK (month ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE TABLE IF NOT EXISTS teacher_monthly_adjustments (
  id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  term_id text REFERENCES academic_terms(id) ON DELETE SET NULL,
  month char(7) NOT NULL,
  item_name text NOT NULL,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('bonus', 'deduction')),
  amount numeric(12, 2) NOT NULL,
  reason text,
  approval_ref text,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (month ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_teacher_monthly_adjustments_teacher_month
  ON teacher_monthly_adjustments(teacher_id, month);

CREATE TABLE IF NOT EXISTS payroll_details (
  id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  term_id text REFERENCES academic_terms(id) ON DELETE SET NULL,
  month char(7) NOT NULL,
  status text NOT NULL CHECK (status IN ('saved', 'generated', 'teacher_confirmed', 'disputed', 'reviewed', 'locked')),
  salary_scheme_version text,
  gross_pay numeric(12, 2) NOT NULL DEFAULT 0,
  tax numeric(12, 2) NOT NULL DEFAULT 0,
  net_pay numeric(12, 2) NOT NULL DEFAULT 0,
  summary_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  line_snapshots jsonb NOT NULL DEFAULT '[]'::jsonb,
  dispute_reason text,
  dispute_resolution text,
  generated_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  generated_at timestamptz,
  saved_at timestamptz,
  published_at timestamptz,
  teacher_confirmed_at timestamptz,
  disputed_at timestamptz,
  reviewed_at timestamptz,
  locked_at timestamptz,
  unlocked_at timestamptz,
  unlock_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, month),
  CHECK (month ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_payroll_details_month_status
  ON payroll_details(month, status);

CREATE INDEX IF NOT EXISTS idx_payroll_details_teacher_month
  ON payroll_details(teacher_id, month);

CREATE TABLE IF NOT EXISTS payroll_detail_rows (
  id text PRIMARY KEY,
  payroll_detail_id text NOT NULL REFERENCES payroll_details(id) ON DELETE CASCADE,
  row_order integer NOT NULL DEFAULT 0,
  item_name text NOT NULL,
  basis text,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_payroll_detail_rows_detail
  ON payroll_detail_rows(payroll_detail_id, row_order);

CREATE TABLE IF NOT EXISTS payroll_batches (
  id text PRIMARY KEY,
  batch_type text NOT NULL DEFAULT 'generate' CHECK (batch_type IN ('generate', 'lock', 'export')),
  term_id text REFERENCES academic_terms(id) ON DELETE SET NULL,
  month char(7) NOT NULL,
  total integer NOT NULL DEFAULT 0 CHECK (total >= 0),
  success_count integer NOT NULL DEFAULT 0 CHECK (success_count >= 0),
  failed_count integer NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (month ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE TABLE IF NOT EXISTS payroll_batch_results (
  id text PRIMARY KEY,
  payroll_batch_id text NOT NULL REFERENCES payroll_batches(id) ON DELETE CASCADE,
  teacher_id text REFERENCES teachers(id) ON DELETE SET NULL,
  ok boolean NOT NULL DEFAULT false,
  status text,
  gross_pay numeric(12, 2),
  net_pay numeric(12, 2),
  error text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_payroll_batch_results_batch
  ON payroll_batch_results(payroll_batch_id, ok);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  sender_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  scope text NOT NULL DEFAULT 'all_teachers',
  target_stage_id text REFERENCES school_stages(id) ON DELETE SET NULL,
  target_grade_id text REFERENCES grades(id) ON DELETE SET NULL,
  target_teacher_id text REFERENCES teachers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS notification_recipients (
  id text PRIMARY KEY,
  notification_id text NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  teacher_id text REFERENCES teachers(id) ON DELETE SET NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_account
  ON notification_recipients(account_id, read_at);

CREATE TABLE IF NOT EXISTS import_batches (
  id text PRIMARY KEY,
  import_type text NOT NULL,
  status text NOT NULL DEFAULT 'previewed' CHECK (status IN ('previewed', 'committed', 'failed')),
  file_name text,
  row_count integer NOT NULL DEFAULT 0 CHECK (row_count >= 0),
  error_count integer NOT NULL DEFAULT 0 CHECK (error_count >= 0),
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  committed_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  action text NOT NULL,
  actor_account_id text REFERENCES accounts(id) ON DELETE SET NULL,
  actor_name text,
  teacher_id text REFERENCES teachers(id) ON DELETE SET NULL,
  term_id text REFERENCES academic_terms(id) ON DELETE SET NULL,
  month char(7),
  entity_type text,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_time
  ON audit_logs(actor_account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_teacher_month
  ON audit_logs(teacher_id, month, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id, created_at DESC);

INSERT INTO schema_migrations (version, description)
VALUES ('001_phase1_schema', 'Phase 1 PostgreSQL schema for scheduling, attendance, payroll, notifications, and audit logs')
ON CONFLICT (version) DO NOTHING;

COMMIT;
