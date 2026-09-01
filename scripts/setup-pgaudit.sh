#!/usr/bin/env bash
# pgaudit 配置（验收 7.14 的「查」部分）。
#
#   sudo bash scripts/setup-pgaudit.sh
#
# 为什么还需要它：应用层审计记业务动作，db_audit_log 记增删改，
# 但 **SELECT 谁都记不了**——触发器对读操作不触发。而「谁把全校工资表
# 导出去了」恰恰是一次 SELECT，不是修改。这条只有 pgaudit 能覆盖。
#
# 代价要说清楚：pgaudit 写的是服务器日志文件，量大且会轮转。这里只对
# 薪资与人事表开审计，不是全库开——全库开会把日志写满磁盘，
# 最后运维为了腾空间把日志删掉，等于没审计。
set -euo pipefail

PG_VERSION="${PG_VERSION:-16}"
PG_CONF="${PG_CONF:-/etc/postgresql/${PG_VERSION}/main/postgresql.conf}"
DB_NAME="${DB_NAME:-school_system}"

echo "PostgreSQL ${PG_VERSION}，配置文件 ${PG_CONF}"

if ! psql -tAc "SELECT 1 FROM pg_available_extensions WHERE name='pgaudit'" | grep -q 1; then
  echo "pgaudit 扩展未安装，先装："
  echo "  Debian/Ubuntu:  apt-get install -y postgresql-${PG_VERSION}-pgaudit"
  echo "  RHEL/CentOS:    yum install -y pgaudit_${PG_VERSION}"
  exit 1
fi

cat >> "${PG_CONF}" <<'CONF'

# --- 学校管理系统：数据库操作审计（验收 7.14 / 7.15）---
shared_preload_libraries = 'pgaudit'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d
# 审计日志至少留 180 天：工资纠纷往往几个月后才提出，
# 默认的 7 天轮转到时候什么都查不到了
log_rotation_size = 0
log_truncate_on_rotation = off
# 只记会话级的读写，不记 DDL 与函数调用——那些量大且与工资无关
pgaudit.log = 'read,write'
pgaudit.log_catalog = off
pgaudit.log_parameter = on
pgaudit.log_relation = on
pgaudit.log_statement_once = off
CONF

echo "已写入配置。重启 PostgreSQL 后生效："
echo "  systemctl restart postgresql"
echo ""
echo "重启后执行以下 SQL，把审计范围收窄到薪资与人事表："
cat <<SQL

CREATE EXTENSION IF NOT EXISTS pgaudit;
-- 只审计敏感表：全库审计会把磁盘写满
CREATE ROLE auditor NOLOGIN;
ALTER DATABASE ${DB_NAME} SET pgaudit.role = 'auditor';
GRANT SELECT, INSERT, UPDATE, DELETE ON
  "app_payrollDetails", "app_payrollBatches", "app_payrollRules",
  "app_hrEmployees", "app_hrContracts", "app_hrSalaryRecords"
  TO auditor;

SQL
echo "验证：查一次工资表，然后在 log/ 下应能看到带 AUDIT: 前缀的记录。"
