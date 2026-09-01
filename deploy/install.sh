#!/usr/bin/env bash
# 全新服务器从零部署（验收 6.2 / 6.3 / 6.7）
#
#   sudo bash deploy/install.sh
#
# 覆盖：环境依赖安装 → 数据库初始化 → 应用部署 → 系统服务 → 权限与备份配置。
# 幂等：重复执行不会破坏已有数据，只补齐缺失的部分。
#
# 目标系统：Ubuntu 22.04 / 24.04 或 Debian 12。其他发行版请照着步骤手工执行。
set -euo pipefail

APP_USER="${APP_USER:-school}"
APP_DIR="${APP_DIR:-/opt/school-system}"
DB_NAME="${DB_NAME:-school_system}"
PG_VERSION="${PG_VERSION:-16}"
NODE_MAJOR="${NODE_MAJOR:-22}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/school-system}"

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m  ! %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m  ✓ %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m  ✗ %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "请用 root 或 sudo 执行"

# ---------------------------------------------------------------------------
log "1/8 检查系统"
# ---------------------------------------------------------------------------
. /etc/os-release 2>/dev/null || die "无法识别操作系统"
echo "  ${PRETTY_NAME}"
case "${ID}" in
  ubuntu|debian) ;;
  *) warn "本脚本针对 Ubuntu/Debian 编写，${ID} 上可能需要手工调整" ;;
esac

# 内存与磁盘：部署到一半才发现空间不够，收拾起来比事先检查麻烦得多
MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
DISK_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
[ "${MEM_MB}" -ge 3500 ] || warn "内存 ${MEM_MB}MB，低于建议的 4GB（1000+ 教师、排课求解会吃内存）"
[ "${DISK_GB}" -ge 40 ] || warn "根分区可用 ${DISK_GB}GB，低于建议的 50GB（含数据库与 180 天备份）"
ok "内存 ${MEM_MB}MB，可用磁盘 ${DISK_GB}GB"

# ---------------------------------------------------------------------------
log "2/8 安装依赖"
# ---------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg git python3 python3-venv python3-pip nginx ufw >/dev/null

if ! command -v node >/dev/null || [ "$(node -v | sed 's/v\([0-9]*\).*/\1/')" -lt "${NODE_MAJOR}" ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
ok "Node $(node -v)"

if ! command -v psql >/dev/null; then
  apt-get install -y -qq "postgresql-${PG_VERSION}" "postgresql-contrib-${PG_VERSION}" >/dev/null
fi
systemctl enable --now postgresql >/dev/null 2>&1 || true
ok "PostgreSQL $(sudo -u postgres psql -tAc 'SHOW server_version;' | head -1)"

# pgaudit 装上但先不启用——启用要改 postgresql.conf 并重启，
# 放在这里做会让部署脚本中途重启数据库，风险不必要
# 用 if 而不是 A && B || C：后者在 B（这里是 ok 输出）失败时也会执行 C，
# 结果就是装成功了却报「安装失败」
if apt-get install -y -qq "postgresql-${PG_VERSION}-pgaudit" >/dev/null 2>&1; then
  ok "pgaudit 已安装（启用见 scripts/setup-pgaudit.sh）"
else
  warn "pgaudit 未能安装，验收 7.14 的 SELECT 审计需手工处理"
fi

# ---------------------------------------------------------------------------
log "3/8 创建运行账号与目录"
# ---------------------------------------------------------------------------
id -u "${APP_USER}" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "${APP_USER}"
mkdir -p "${APP_DIR}" "${BACKUP_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}" "${BACKUP_DIR}"
# 备份里是全校工资与身份证，目录权限必须收紧
chmod 700 "${BACKUP_DIR}"
ok "运行账号 ${APP_USER}，应用目录 ${APP_DIR}，备份目录 ${BACKUP_DIR}"

# ---------------------------------------------------------------------------
log "4/8 部署应用代码"
# ---------------------------------------------------------------------------
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ "${SRC_DIR}" != "${APP_DIR}" ]; then
  # --delete 只作用于代码，data/ 与 backups/ 明确排除，否则会把数据一起删了
  rsync -a --delete \
    --exclude node_modules --exclude .git --exclude 'config/*.env' \
    --exclude 'server/data' --exclude backups \
    "${SRC_DIR}/" "${APP_DIR}/"
fi
cd "${APP_DIR}"
sudo -u "${APP_USER}" npm ci --omit=dev >/dev/null 2>&1 || sudo -u "${APP_USER}" npm install --omit=dev >/dev/null
ok "应用代码已部署"

# 排课求解器：不装 ortools 也能跑，但会静默退化成启发式算法，
# 排出来的课表质量下降且没有任何提示，所以生产必须装
python3 -m venv "${APP_DIR}/.venv-solver" 2>/dev/null || true
if "${APP_DIR}/.venv-solver/bin/pip" install -q -r "${APP_DIR}/server/solver/requirements.txt"; then
  ok "OR-Tools 求解器就绪"
else
  warn "OR-Tools 安装失败，排课将退化为启发式算法"
fi
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/.venv-solver"

# ---------------------------------------------------------------------------
log "5/8 初始化数据库"
# ---------------------------------------------------------------------------
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres createdb "${DB_NAME}"
ok "数据库 ${DB_NAME} 就绪"

# ---------------------------------------------------------------------------
log "6/8 生成配置"
# ---------------------------------------------------------------------------
CONF="${APP_DIR}/config/production.env"
if [ -f "${CONF}" ]; then
  ok "配置已存在，保留不动：${CONF}"
else
  DB_APP_PWD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
  DB_OPS_PWD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
  DB_RO_PWD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
  ENC_KEY="$(openssl rand -hex 32)"

  install -o "${APP_USER}" -g "${APP_USER}" -m 600 /dev/null "${CONF}"
  cat > "${CONF}" <<CONFEOF
NODE_ENV=production
PORT=4173
HOST=127.0.0.1
DATABASE_URL=postgresql://school_app:${DB_APP_PWD}@127.0.0.1:5432/${DB_NAME}
PG_POOL_MAX=20
HR_ENCRYPTION_KEY=${ENC_KEY}
SCHEDULER_PYTHON=${APP_DIR}/.venv-solver/bin/python
TRUST_PROXY=1
FORCE_HTTPS=0
CORS_ALLOW_ORIGIN=
LOGIN_MAX_PER_IP=3000
LOGIN_FAIL_MAX_PER_IP=60
BACKUP_DIR=${BACKUP_DIR}
CONFEOF
  chown "${APP_USER}:${APP_USER}" "${CONF}"
  chmod 600 "${CONF}"

  DB_APP_PASSWORD="${DB_APP_PWD}" DB_OPS_PASSWORD="${DB_OPS_PWD}" DB_READONLY_PASSWORD="${DB_RO_PWD}" \
    DATABASE_URL="postgresql:///${DB_NAME}" \
    sudo -u postgres -E node "${APP_DIR}/scripts/provision-db-roles.js" >/dev/null
  ok "已生成配置与数据库账号"

  cat <<KEYEOF

  ┌──────────────────────────────────────────────────────────────┐
  │  以下内容只显示这一次，请立即抄下并异地保管                  │
  ├──────────────────────────────────────────────────────────────┤
  │  加密密钥 HR_ENCRYPTION_KEY：
  │    ${ENC_KEY}
  │  运维账号 school_ops 口令：${DB_OPS_PWD}
  │  只读账号 school_readonly 口令：${DB_RO_PWD}
  └──────────────────────────────────────────────────────────────┘

  加密密钥必须与数据库备份分开保管：放在同一台机器上等于没加密，
  拿到备份的人同时拿到了钥匙。丢了它，已加密的工资与人事数据永久无法恢复。

KEYEOF
fi

# ---------------------------------------------------------------------------
log "7/8 配置系统服务"
# ---------------------------------------------------------------------------
sed -e "s|@APP_DIR@|${APP_DIR}|g" -e "s|@APP_USER@|${APP_USER}|g" \
  "${APP_DIR}/deploy/school-system.service" > /etc/systemd/system/school-system.service
systemctl daemon-reload
systemctl enable school-system >/dev/null
ok "已配置开机自启"

# 每日 02:17 备份。不用整点是因为整点是各类定时任务的高峰，
# 备份与其他任务抢 IO 会拖长时间。
cat > /etc/cron.d/school-system-backup <<CRONEOF
17 2 * * * ${APP_USER} cd ${APP_DIR} && /usr/bin/node --env-file=${CONF} scripts/backup-db.js >> /var/log/school-backup.log 2>&1
CRONEOF
ok "已配置每日 02:17 自动备份"

install -o "${APP_USER}" -g "${APP_USER}" -m 640 /dev/null /var/log/school-backup.log 2>/dev/null || true

# ---------------------------------------------------------------------------
log "8/8 启动并自检"
# ---------------------------------------------------------------------------
systemctl restart school-system
sleep 5
if systemctl is-active --quiet school-system; then
  ok "服务已启动"
else
  journalctl -u school-system -n 30 --no-pager
  die "服务启动失败，日志见上"
fi

HEALTH=$(curl -fsS "http://127.0.0.1:4173/api/health" 2>/dev/null || echo "")
[ -n "${HEALTH}" ] || die "健康检查未通过，服务可能未正常监听"
echo "  ${HEALTH}" | head -c 300; echo

cat <<'NEXTEOF'

部署完成。上线前还须完成：

  1. 配置 HTTPS
       certbot --nginx -d <域名>
     证书就绪后把 config/production.env 里的 FORCE_HTTPS 改为 1 并重启服务。
     在此之前工资与身份证是明文过网的。

  2. 轮换默认口令（所有账号出厂口令均为 123456）
       node --env-file=config/production.env scripts/rotate-passwords.js --check
       node --env-file=config/production.env scripts/rotate-passwords.js --admins

  3. 验证备份能恢复
       node --env-file=config/production.env scripts/backup-db.js
     不验证的备份等于没有备份。

  4. 可选：启用数据库 SELECT 审计
       sudo bash scripts/setup-pgaudit.sh

常用运维命令见 docs/运维手册.md
NEXTEOF
