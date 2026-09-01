#!/usr/bin/env node
// 生成数据库设计文档（验收 7.3 / 7.4 / 9.7）
//
//   node scripts/generate-db-doc.js            写入 docs/数据库设计文档.md
//   node scripts/generate-db-doc.js --check    只检查注解是否齐全，不写文件
//
// 文档是**生成**的，不是手写的：字段定义散在代码与数据里，手写一份下次加个
// 字段就过时了。校方查阅时看到过时的文档比没有更糟——他会以为那就是现状。
//
// 每次改了字段就重跑一次，文档自然跟上。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDatabase } from "../server/storage.js";
import { COLLECTION_NOTES, buildErDiagram, buildSchemaDoc } from "../server/db/schemaDoc.js";

const checkOnly = process.argv.includes("--check");
const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = path.join(ROOT, "docs", "数据库设计文档.md");

const db = await ensureDatabase();
const doc = buildSchemaDoc(db);

// 注解缺失检查：机械部分不会说谎，但业务含义漏了就只剩一堆字段名
const missing = doc.descriptions.filter((d) => d.rowCount > 0 && !COLLECTION_NOTES[d.key]);
if (missing.length) {
  console.warn(`⚠ 以下 ${missing.length} 个集合缺少业务含义注解，请补充 server/db/schemaDoc.js 的 COLLECTION_NOTES：`);
  missing.forEach((d) => console.warn(`    ${d.key}（${d.rowCount} 行）`));
}
if (checkOnly) {
  console.log(`\n共 ${doc.descriptions.length} 个集合，其中 ${doc.descriptions.filter((d) => d.rowCount > 0).length} 个有数据`);
  console.log(missing.length ? "✗ 注解不齐全" : "✓ 注解齐全");
  process.exit(missing.length ? 1 : 0);
}

const DOMAIN_ORDER = ["人事", "排课", "薪资", "系统", "其他"];
const byDomain = new Map(DOMAIN_ORDER.map((d) => [d, []]));
doc.descriptions.forEach((d) => {
  if (!byDomain.has(d.domain)) byDomain.set(d.domain, []);
  byDomain.get(d.domain).push(d);
});

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
const lines = [];
const w = (s = "") => lines.push(s);

w("# 数据库设计文档");
w();
w("对应验收清单 7.1–7.7、9.7。");
w();
w(`> 本文档由 \`node scripts/generate-db-doc.js\` 从**当前数据库的真实结构与数据**生成，`);
w("> 字段、类型、约束、索引均为实际状态，不是设计意图的描述。");
w("> 改动字段后重新执行即可更新。");
w();

// --- 1. 数据库基本信息（7.1）---
w("## 一、数据库基本信息（验收 7.1）");
w();
w("| 项目 | 取值 |");
w("| --- | --- |");
w("| 数据库类型 | PostgreSQL |");
w("| 最低版本 | 14（用到生成列与可延迟外键） |");
w("| 建议版本 | 16 |");
w("| 字符集 | UTF8 |");
w("| 排序规则 | 建库时统一指定，全库一致 |");
w("| 连接方式 | 应用以受限账号 `school_app` 连接，不使用超级用户 |");
w();

// --- 2. 存储模型 ---
w("## 二、存储模型");
w();
w("业务数据采用**文档式存储**：每个业务集合对应一张 `app_<集合名>` 表，结构统一为");
w();
w("```sql");
w("CREATE TABLE \"app_<集合名>\" (");
w("  id          text PRIMARY KEY,          -- 业务主键");
w("  seq         bigint NOT NULL DEFAULT 0, -- 行序，用于还原数组顺序");
w("  data        jsonb NOT NULL,            -- 业务字段");
w("  updated_at  timestamptz NOT NULL DEFAULT now()");
w(");");
w("```");
w();
w("**为什么外键与索引仍然成立**：对需要约束的字段建立 PostgreSQL 生成列，");
w("再在生成列上建外键与索引。例如课次表引用教师：");
w();
w("```sql");
w("ALTER TABLE \"app_lessonInstances\"");
w("  ADD COLUMN fk_teacher_id text GENERATED ALWAYS AS (NULLIF(data->>'teacherId','')) STORED;");
w("ALTER TABLE \"app_lessonInstances\"");
w("  ADD CONSTRAINT fk_lessoninstances_teacherid_teachers");
w("  FOREIGN KEY (fk_teacher_id) REFERENCES \"app_teachers\"(id) ON DELETE RESTRICT");
w("  DEFERRABLE INITIALLY DEFERRED;");
w("```");
w();
w("外键声明为 `DEFERRABLE INITIALLY DEFERRED`——持久化时各集合的写入顺序不固定，");
w("「新建学期 + 新建引用该学期的班级」在同一事务内会先写班级；延迟到提交时校验才不会误判。");
w();

// --- 3. ER 图（7.3）---
w("## 三、实体关系图（验收 7.3）");
w();
w("仅绘制存在外键关系的表。完整字段见第五节。");
w();
w("```mermaid");
w(buildErDiagram(doc.descriptions));
w("```");
w();

// --- 4. 表清单（7.2）---
w("## 四、业务分表清单（验收 7.2）");
w();
w("人事、排课、薪资三类业务分表存放，互不混用：");
w();
w("| 业务域 | 表数 | 表 |");
w("| --- | --- | --- |");
for (const domain of DOMAIN_ORDER) {
  const list = (byDomain.get(domain) || []).filter((d) => COLLECTION_NOTES[d.key]);
  if (!list.length) continue;
  w(`| ${domain} | ${list.length} | ${list.map((d) => `\`${d.table}\``).join("、")} |`);
}
w();
w("**教师主键统一关联（验收 7.5）**：`teacherId` 是人事、排课、薪资三域的统一关联键。");
w("人事档案 `employees.teacherId` → 教师主数据 `teachers.id` ← 课次 `lessonInstances.teacherId`、");
w("工资单 `payrollDetails.teacherId`。删除教师时被外键拦截（见第六节）。");
w();

// --- 5. 字段字典（7.4）---
w("## 五、字段字典（验收 7.4）");
w();
w("字段与类型由当前数据推断，「出现率」为该字段在样本中非空的比例——");
w("低于 100% 说明是可选字段。「取值」列出的是实际出现过的枚举值。");
w();

for (const domain of DOMAIN_ORDER) {
  const list = (byDomain.get(domain) || []).filter((d) => d.fields.length > 0);
  if (!list.length) continue;
  w(`### ${domain}域`);
  w();
  for (const d of list) {
    const tags = [];
    if (d.sensitive) tags.push("敏感表（运维账号无权访问）");
    if (d.appendOnly) tags.push("只追加（不可改删）");
    if (d.unloadable) tags.push("归档后不加载进内存");
    if (d.ledgerType) tags.push(`属${d.ledgerType === "hr" ? "人事" : d.ledgerType === "scheduling" ? "排课" : "薪资"}账套`);

    w(`#### \`${d.table}\` ${d.label}`);
    w();
    if (d.note) w(`${d.note}`);
    w();
    w(`当前 ${d.rowCount.toLocaleString()} 行${d.sampled < d.rowCount ? `（抽样 ${d.sampled} 行推断字段）` : ""}${tags.length ? ` · ${tags.join(" · ")}` : ""}`);
    w();
    w("| 字段 | 类型 | 出现率 | 约束 | 取值 / 示例 | 说明 |");
    w("| --- | --- | --- | --- | --- | --- |");
    d.fields.forEach((f) => {
      w(
        `| \`${esc(f.name)}\` | ${f.type} | ${f.presence}% | ${esc(f.constraints.join("、"))} | ${esc(f.enumValues || f.sample)} | ${esc(f.note)} |`,
      );
    });
    w();
  }
}

// --- 6. 约束与索引（7.6 / 7.7）---
w("## 六、约束与索引（验收 7.6 / 7.7）");
w();
w(`### 外键约束（共 ${doc.foreignKeys.length} 条）`);
w();
w("全部为 `RESTRICT`：存在关联数据时删除会被数据库拒绝，不会级联清空。");
w();
w("| 子表 | 字段 | 父表 | 删除行为 |");
w("| --- | --- | --- | --- |");
doc.foreignKeys.forEach((fk) => w(`| \`app_${fk.child}\` | \`${fk.field}\` | \`app_${fk.parent}\` | ${fk.onDelete} |`));
w();
w("现场验证方式（验收 7.6）：");
w();
w("```sql");
w("DELETE FROM \"app_teachers\" WHERE id = '<某有课教师>';");
w("-- ERROR: update or delete on table \"app_teachers\" violates foreign key constraint");
w("--        \"fk_lessoninstances_teacherid_teachers\" on table \"app_lessonInstances\"");
w("```");
w();
w(`### 索引（共 ${doc.indexes.length} 个）`);
w();
w("覆盖验收 7.7 要求的高频字段：教职工姓名、工号、班级、核算月份、课时日期。");
w();
w("| 表 | 字段 | 索引名 |");
w("| --- | --- | --- |");
doc.indexes.forEach((i) => w(`| \`app_${i.collection}\` | \`${i.field}\` | \`idx_${i.collection.toLowerCase()}_${i.field.toLowerCase()}\` |`));
w();
w("此外每个外键列自带一个索引（`<外键名>_idx`），避免父表删除时全表扫子表。");
w();

// --- 7. 加密与权限 ---
w("## 七、敏感数据与权限（验收 7.12 / 7.13 / 7.16）");
w();
w("### 加密字段");
w();
w("| 字段 | 所在表 | 算法 |");
w("| --- | --- | --- |");
w("| `idCardEncrypted` 身份证号 | `app_employees` | AES-256-GCM，随机 IV |");
w("| `bankCardEncrypted` 银行卡号 | `app_employees` | AES-256-GCM，随机 IV |");
w("| `encryptedPayload` 工资金额 | `app_payrollDetails` | AES-256-GCM，随机 IV |");
w("| 证件附件文件内容 | 磁盘 `attachments/` | AES-256-GCM，随机 IV |");
w();
w("密钥来自环境变量 `HR_ENCRYPTION_KEY`，**必须与数据库备份分开保管**——");
w("放在同一台机器上等于没加密。密钥丢失则已加密数据永久无法恢复。");
w();
w("代价：加密字段无法在数据库层做聚合查询，所有统计需经应用层解密后计算。");
w();
w("### 数据库账号");
w();
w("| 账号 | 用途 | 敏感表权限 |");
w("| --- | --- | --- |");
w("| `school_app` | 应用连接 | 读写 |");
w("| `school_ops` | 运维巡检 | **无任何权限** |");
w("| `school_readonly` | 报表只读 | **无任何权限** |");
w();
w("敏感表：" + [...new Set(doc.descriptions.filter((d) => d.sensitive).map((d) => `\`${d.table}\``))].join("、"));
w();

w("---");
w();
w(`生成时间：${doc.generatedAt}`);
w(`集合总数：${doc.descriptions.length}，其中当前有数据的 ${doc.descriptions.filter((d) => d.rowCount > 0).length} 个`);

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, `${lines.join("\n")}\n`, "utf-8");

const stat = await fs.stat(OUT);
console.log(`✓ 已生成 ${path.relative(ROOT, OUT)}（${Math.round(stat.size / 1024)} KB，${lines.length} 行）`);
console.log(`  覆盖 ${doc.descriptions.filter((d) => d.rowCount > 0).length} 个有数据的集合、${doc.foreignKeys.length} 条外键、${doc.indexes.length} 个索引`);
if (missing.length) console.log(`  ⚠ ${missing.length} 个集合缺业务注解`);
process.exit(0);
