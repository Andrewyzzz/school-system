-- =============================================================================
-- 第二阶段 M2 关系投影补丁
-- 1) hr_flows.flow_type 允许 'profile_update'（档案变更申请复用审批流结构）
-- 2) hr_audit_logs 增加 target_type/target_id（审计目标不限于员工：组织节点、岗位、模板、花名册导出）
-- =============================================================================

ALTER TABLE hr_flows DROP CONSTRAINT IF EXISTS hr_flows_flow_type_check;
ALTER TABLE hr_flows
  ADD CONSTRAINT hr_flows_flow_type_check
  CHECK (flow_type IN ('onboard', 'transfer', 'offboard', 'profile_update'));

ALTER TABLE hr_audit_logs ADD COLUMN IF NOT EXISTS target_type text;
ALTER TABLE hr_audit_logs ADD COLUMN IF NOT EXISTS target_id text;

-- 3) accounts.role 允许 'hr'（人事专员角色）。accounts 是 001 导出投影表，
--    仅在应用过 001 schema 的库上执行（开发库运行时用 app_* 文档表，可能没有该表）。
DO $$
BEGIN
  IF to_regclass('accounts') IS NOT NULL THEN
    ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_role_check;
    ALTER TABLE accounts
      ADD CONSTRAINT accounts_role_check
      CHECK (role IN ('teacher', 'finance', 'admin', 'system_admin', 'classroom', 'hr', 'division_head'));
  END IF;
END $$;
