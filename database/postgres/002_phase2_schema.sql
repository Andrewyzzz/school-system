-- =============================================================================
-- 第二阶段（人事管控）关系型 Schema
-- 对齐 docs/学校人事管控系统-第二阶段PRD.md 第 6 节
--
-- 与运行时存储的关系：
--   运行时沿用内存域模型 + app_* 文档表差量持久化（server/db/postgresStore.js），
--   本文件是 HR 域的规范化关系投影，用于报表、审计取证与后续按表列级迁移；
--   字段命名与运行时集合（db.orgUnits / db.employees / ...）一一对应。
--
-- 敏感字段约定：id_card_encrypted、bank_card_encrypted 存应用层 AES-256-GCM 密文
-- （格式 pii:v1:...，见 server/security/pii.js），数据库内永不出现明文。
-- =============================================================================

-- 组织架构节点（总校 → 学部 → 部门/年级组）
CREATE TABLE IF NOT EXISTS org_units (
  id            text PRIMARY KEY,
  parent_id     text REFERENCES org_units (id),
  type          text NOT NULL CHECK (type IN ('school', 'division', 'department', 'grade_group')),
  name          text NOT NULL,
  -- 教学类学部与一阶段排课模型的映射（如 primary/middle/high），非教学节点为空
  stage_id      text,
  display_order integer NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_units_parent ON org_units (parent_id) WHERE status = 'active';

-- 岗位字典
CREATE TABLE IF NOT EXISTS positions (
  id         text PRIMARY KEY,
  code       text NOT NULL UNIQUE,
  name       text NOT NULL,
  -- 岗位序列：teacher 教师 / admin 行政 / logistics 后勤 / medical 校医 /
  -- driver 司机 / canteen 食堂 / kindergarten 幼儿园 / recruit 招生 / security 安保
  series     text NOT NULL,
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 人员档案（全员）。教学专有字段仍在一阶段 teachers 表，通过 teacher_id 关联。
CREATE TABLE IF NOT EXISTS employees (
  id                  text PRIMARY KEY,
  employee_no         text NOT NULL UNIQUE,
  person_name         text NOT NULL,
  gender              text,
  birth_date          date,
  id_card_encrypted   text,            -- AES-256-GCM 密文
  id_card_masked      text,            -- 掩码展示值（冗余存储，避免列表页解密）
  phone               text,
  emergency_contact   text,
  emergency_phone     text,
  bank_card_encrypted text,            -- AES-256-GCM 密文
  bank_card_masked    text,
  org_unit_id         text REFERENCES org_units (id),
  position_id         text REFERENCES positions (id),
  reports_to          text REFERENCES employees (id),
  teacher_id          text,            -- 关联一阶段 teachers.id（教师类岗位）
  -- 状态机：pending_onboard 待入职 / probation 试用期 / active 在职 /
  -- transferring 调岗中 / offboarding 离职中 / left 已离职 / suspended 停用
  status              text NOT NULL DEFAULT 'pending_onboard'
                      CHECK (status IN ('pending_onboard', 'probation', 'active',
                                        'transferring', 'offboarding', 'left', 'suspended')),
  hired_at            date,
  regularized_at      date,            -- 转正日期
  left_at             date,            -- 离职生效日期
  salary_template_id  text,
  salary_template_ver integer,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_org_status ON employees (org_unit_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees (status);
CREATE INDEX IF NOT EXISTS idx_employees_teacher ON employees (teacher_id) WHERE teacher_id IS NOT NULL;

-- 劳动合同（一人多份，续签追加）
CREATE TABLE IF NOT EXISTS employee_contracts (
  id          text PRIMARY KEY,
  employee_id text NOT NULL REFERENCES employees (id),
  type        text NOT NULL,           -- fixed_term 固定期限 / open_term 无固定期限 / internship 实习 等
  start_date  date NOT NULL,
  end_date    date,
  signed_at   date,
  file_ref    text,                    -- 线下扫描件存储路径/编号
  remark      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_employee ON employee_contracts (employee_id, start_date DESC);

-- 岗位薪资模板 + 版本（模板修改产生新版本，只影响之后的入职/调岗）
CREATE TABLE IF NOT EXISTS salary_templates (
  id          text PRIMARY KEY,
  position_id text NOT NULL REFERENCES positions (id),
  name        text NOT NULL,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salary_template_versions (
  id             text PRIMARY KEY,
  template_id    text NOT NULL REFERENCES salary_templates (id),
  version        integer NOT NULL,
  payload        jsonb NOT NULL,       -- 工资档案默认值（结构对齐一阶段 salaryProfile）
  effective_from date NOT NULL,
  created_by     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, version)
);

-- 人事审批流实例（入职/调岗/离职；结构为第三阶段 OA 预留 flow_type 扩展）
CREATE TABLE IF NOT EXISTS hr_flows (
  id           text PRIMARY KEY,
  flow_type    text NOT NULL CHECK (flow_type IN ('onboard', 'transfer', 'offboard')),
  employee_id  text REFERENCES employees (id),   -- 入职流程在建档前可为空
  payload      jsonb NOT NULL,                   -- 表单内容（拟岗位、生效日期、原因等）
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  current_step integer NOT NULL DEFAULT 0,
  created_by   text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  closed_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_hr_flows_status ON hr_flows (status, flow_type);
CREATE INDEX IF NOT EXISTS idx_hr_flows_employee ON hr_flows (employee_id);

CREATE TABLE IF NOT EXISTS hr_flow_steps (
  id         text PRIMARY KEY,
  flow_id    text NOT NULL REFERENCES hr_flows (id),
  step_index integer NOT NULL,
  step_name  text NOT NULL,            -- 学部审批 / 总校审批 等
  actor_id   text,                     -- 处理人账号
  action     text CHECK (action IN ('approve', 'reject', 'withdraw')),
  comment    text,
  acted_at   timestamptz,
  UNIQUE (flow_id, step_index)
);

-- 人事审计（只追加；字段级 diff）
CREATE TABLE IF NOT EXISTS hr_audit_logs (
  id                 text PRIMARY KEY,
  actor_account_id   text NOT NULL,
  actor_name         text,
  action             text NOT NULL,    -- employee_update / sensitive_view / roster_export / flow_approve ...
  target_employee_id text,
  field_diffs        jsonb,            -- [{field, before, after}]，敏感字段 diff 存掩码值
  reason             text,
  client_ip          text,
  user_agent         text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hr_audit_target ON hr_audit_logs (target_employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_audit_actor ON hr_audit_logs (actor_account_id, created_at DESC);
