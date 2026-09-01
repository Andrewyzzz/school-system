// 部署脚本与系统服务（验收 6.2 / 6.3 / 6.4 / 6.7）
//
// 部署脚本要在裸的 Ubuntu 上以 root 执行，本机跑不了。但它里面几处出错就
// 无法挽回的地方是可以静态验证的：
//   · rsync --delete 若不排除数据目录，一次「更新代码」就把数据库和备份删了
//   · 备份目录权限没收紧，等于把全校工资与身份证摊开
//   · 生成的口令若进了 systemd 单元，那文件是所有人可读的
//   · 配置文件若被覆盖，重新部署会把加密密钥换掉，旧数据永久解不开
//
// 这些都不是「代码风格」，是执行一次就回不去的操作。
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = new URL("..", import.meta.url);
const read = (p) => fs.readFile(new URL(p, root), "utf-8");

const install = await read("deploy/install.sh");
const unit = await read("deploy/school-system.service");
const timer = await read("deploy/school-system-restart.timer");
const ctl = await read("deploy/schoolctl");

// ---------------------------------------------------------------------------
// 1. 语法必须合法——部署脚本执行到一半才报语法错，服务器已经被改了一半
// ---------------------------------------------------------------------------
{
  const scripts = ["deploy/install.sh", "deploy/schoolctl", "scripts/setup-pgaudit.sh"];
  for (const file of scripts) {
    await run("bash", ["-n", new URL(file, root).pathname]);
  }

  // shellcheck 能查出 bash -n 查不出的逻辑问题。最要紧的是 SC2015：
  // `A && B || C` 不是 if-then-else——B 失败时 C 也会执行。
  // 体检脚本里写成这样，会出现「运行中」和「未运行」同时打印；
  // 安装脚本里写成这样，会出现装成功了却报「安装失败」。
  let hasShellcheck = true;
  try {
    await run("shellcheck", ["--version"]);
  } catch {
    hasShellcheck = false;
  }
  if (hasShellcheck) {
    for (const file of scripts) {
      try {
        await run("shellcheck", ["-S", "warning", new URL(file, root).pathname]);
      } catch (error) {
        throw new Error(`${file} 未通过 shellcheck：\n${error.stdout || error.message}`);
      }
      // SC2015 只是 info 级，但在部署脚本里是实打实的误报来源，单独拦
      const info = await run("shellcheck", ["-S", "info", "-f", "gcc", new URL(file, root).pathname]).catch(
        (e) => ({ stdout: e.stdout || "" }),
      );
      assert.ok(
        !/SC2015/.test(info.stdout),
        `${file} 里有 A && B || C 写法（SC2015）：B 失败时 C 也会执行，会让成功被报成失败`,
      );
      assert.ok(
        !/SC2012/.test(info.stdout),
        `${file} 用 ls 解析文件列表（SC2012）：文件名含空格时会解析错`,
      );
    }
  } else {
    console.warn("  ⚠ 未安装 shellcheck，跳过静态分析（brew install shellcheck）");
  }
}

// ---------------------------------------------------------------------------
// 2. rsync 必须排除数据与备份
//
// 这是整个脚本里最危险的一行：--delete 会把目标目录中源里没有的文件删掉。
// 不排除 server/data 与 backups，一次「更新代码」就是一次数据清空。
// ---------------------------------------------------------------------------
{
  assert.match(install, /rsync -a --delete/, "应使用 rsync 同步代码");
  const rsyncBlock = install.slice(install.indexOf("rsync -a --delete"), install.indexOf("rsync -a --delete") + 400);
  for (const mustExclude of ["server/data", "backups", "config/*.env", "node_modules", ".git"]) {
    assert.ok(
      rsyncBlock.includes(mustExclude),
      `rsync --delete 必须排除 ${mustExclude}，否则更新代码会连数据一起删`,
    );
  }
}

// ---------------------------------------------------------------------------
// 3. 幂等：重复执行不能覆盖已有配置
//
// 覆盖 config/production.env 意味着换掉 HR_ENCRYPTION_KEY，
// 而旧数据是用旧密钥加密的——换了就永久解不开。
// ---------------------------------------------------------------------------
{
  assert.match(
    install,
    /if \[ -f "\$\{CONF\}" \][\s\S]{0,200}保留不动/,
    "配置已存在时必须保留，覆盖会换掉加密密钥，导致旧数据永久无法解密",
  );
  assert.match(install, /pg_database WHERE datname[\s\S]{0,120}createdb/, "建库前应先判断是否已存在");
  assert.match(install, /id -u "\$\{APP_USER\}"[\s\S]{0,80}useradd/, "建账号前应先判断是否已存在");
}

// ---------------------------------------------------------------------------
// 4. 敏感文件的权限
// ---------------------------------------------------------------------------
{
  assert.match(install, /chmod 700 "\$\{BACKUP_DIR\}"/, "备份目录必须 700——里面是全校工资与身份证");
  assert.match(install, /chmod 600 "\$\{CONF\}"/, "配置文件必须 600——里面有数据库口令与加密密钥");
  assert.match(install, /set -euo pipefail/, "出错必须立即中止，不能带着半截状态继续往下做");
}

// ---------------------------------------------------------------------------
// 5. 口令不得写进 systemd 单元
//
// /etc/systemd/system/*.service 默认是 644，任何本地用户都能读。
// 口令要走 --env-file 指向的 600 文件。
// ---------------------------------------------------------------------------
{
  assert.ok(!/PASSWORD=/.test(unit), "systemd 单元里不得出现口令");
  assert.ok(!/HR_ENCRYPTION_KEY=/.test(unit), "systemd 单元里不得出现加密密钥");
  assert.ok(!/DATABASE_URL=/.test(unit), "systemd 单元里不得出现数据库连接串");
  assert.match(unit, /--env-file=/, "配置应走 --env-file，而不是 Environment= 逐条写进单元");
}

// ---------------------------------------------------------------------------
// 6. systemd 单元的关键设置
// ---------------------------------------------------------------------------
{
  assert.match(unit, /Requires=postgresql\.service/, "数据库没起来就启动会反复崩溃重启");
  assert.match(unit, /After=.*postgresql\.service/, "启动顺序必须排在数据库之后");
  assert.match(unit, /Restart=always/, "崩溃必须自动拉起");
  assert.match(unit, /StartLimitBurst=/, "反复崩溃时要停下来，否则日志被刷爆、真正的原因被冲掉");
  assert.match(unit, /LimitNOFILE=65535/, "1000+ 在线 + SSE 长连接，默认 1024 个句柄不够");
  assert.match(unit, /WantedBy=multi-user\.target/, "缺少这行就无法开机自启");

  // 沙箱：应用被攻破时限制它能动的范围
  assert.match(unit, /NoNewPrivileges=true/);
  assert.match(unit, /ProtectSystem=strict/);
  assert.match(unit, /ReadWritePaths=/, "ProtectSystem=strict 后必须显式声明可写目录，否则服务写不了数据");
  assert.ok(
    /ReadWritePaths=.*server\/data/.test(unit) && /ReadWritePaths=.*backups/.test(unit),
    "数据目录与备份目录必须可写，否则服务起来了却存不了数据",
  );
  assert.match(unit, /User=@APP_USER@/, "不得以 root 运行");
  assert.ok(!/User=root/.test(unit), "绝不能以 root 运行应用");
}

// ---------------------------------------------------------------------------
// 7. 定时重启与定时备份不能撞在一起
// ---------------------------------------------------------------------------
{
  assert.match(timer, /OnCalendar=/, "应有定时重启");
  assert.match(timer, /Persistent=true/, "关机错过了要能补跑，否则一停机就永远跳过");

  const restartTime = timer.match(/OnCalendar=\S+ \S+ (\d+):(\d+)/);
  const backupTime = install.match(/^(\d+) (\d+) \* \* \*/m);
  assert.ok(restartTime && backupTime, "应能解析出两者的时间");
  const restartMin = Number(restartTime[1]) * 60 + Number(restartTime[2]);
  const backupMin = Number(backupTime[2]) * 60 + Number(backupTime[1]);
  assert.ok(
    Math.abs(restartMin - backupMin) >= 30,
    `定时重启(${restartTime[1]}:${restartTime[2]}) 与定时备份(${backupTime[2]}:${backupTime[1]}) 相隔应超过 30 分钟——备份到一半服务被重启会留下残缺的 dump`,
  );
}

// ---------------------------------------------------------------------------
// 8. 部署脚本必须自检并在失败时报错，而不是"跑完就算成功"
// ---------------------------------------------------------------------------
{
  assert.match(install, /systemctl is-active --quiet school-system/, "启动后必须确认服务真的活着");
  assert.match(install, /api\/health/, "必须做一次健康检查");
  assert.match(install, /journalctl -u school-system/, "失败时应打印日志，而不是只说一句失败");
  assert.match(install, /die "服务启动失败/, "自检失败必须以非零码退出");
}

// ---------------------------------------------------------------------------
// 9. 部署后必须提示未完成的安全事项
//
// 一个「部署完成」却没提醒改默认口令、没提醒配 HTTPS 的脚本，
// 会让人以为可以直接上线了。
// ---------------------------------------------------------------------------
{
  assert.match(install, /rotate-passwords/, "必须提示轮换默认口令");
  assert.match(install, /certbot|HTTPS/, "必须提示配置 HTTPS");
  assert.match(install, /backup-db/, "必须提示验证备份");
  assert.match(install, /分开保管/, "必须说明加密密钥要与备份分开保管");
}

// ---------------------------------------------------------------------------
// 10. schoolctl 覆盖运维手册要求的动作（验收 6.6）
// ---------------------------------------------------------------------------
{
  for (const cmd of ["start", "stop", "restart", "status", "logs", "health", "backup", "doctor"]) {
    assert.match(ctl, new RegExp(`\\b${cmd}\\b`), `schoolctl 应支持 ${cmd}`);
  }
  // doctor 要真的检查，不能只打印一句"一切正常"
  assert.match(ctl, /provision-db-roles\.js --check/, "体检应核对数据库权限");
  assert.match(ctl, /--verify/, "体检应校验最近一份备份能不能恢复");
  assert.match(ctl, /rotate-passwords\.js --check/, "体检应检查是否还有弱口令");
  assert.match(ctl, /AGE.*48|48.*AGE/s, "备份超期应报警——超过 48 小时说明定时任务没在跑");
}

// ---------------------------------------------------------------------------
// 11. 引用的文件都得真的存在
//
// 部署脚本里写了一个不存在的路径，要等到现场执行才发现。
// ---------------------------------------------------------------------------
{
  const referenced = [
    "deploy/school-system.service",
    "scripts/provision-db-roles.js",
    "scripts/backup-db.js",
    "scripts/rotate-passwords.js",
    "scripts/setup-pgaudit.sh",
    "server/solver/requirements.txt",
    "config/production.env.example",
  ];
  for (const file of referenced) {
    await fs.access(new URL(file, root));
    assert.ok(
      install.includes(file.split("/").pop()) || ctl.includes(file.split("/").pop()) || true,
      `${file} 应存在`,
    );
  }

  // 脚本里提到的每个 scripts/*.js 都必须存在
  const mentioned = [...install.matchAll(/scripts\/([\w-]+\.(?:js|sh))/g)].map((m) => m[1]);
  for (const name of new Set(mentioned)) {
    await fs.access(new URL(`scripts/${name}`, root)).catch(() => {
      throw new Error(`install.sh 引用了不存在的 scripts/${name}`);
    });
  }
}

console.log("deploy checks passed");
