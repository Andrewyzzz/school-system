-- 早自习作为独立的固定日程类型，供已初始化的数据库增量升级。
-- 新库由 001_phase1_schema.sql 直接包含该取值。
ALTER TABLE schedule_period_templates
  DROP CONSTRAINT IF EXISTS schedule_period_templates_period_type_check;

ALTER TABLE schedule_period_templates
  ADD CONSTRAINT schedule_period_templates_period_type_check
  CHECK (period_type IN ('regular', 'self_study', 'morning_study', 'activity', 'evening_study'));
