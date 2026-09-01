// 数据库设计文档（验收 7.3 / 7.4 / 9.7）
//
// 这份文档是生成的，所以它唯一的风险不是「写错」，而是**与代码脱节**：
//   · 新加了集合却没写业务注解 → 文档里出现一张没人知道是干什么的表
//   · 枚举说明写错值 → 校方按文档去核对，发现对不上
//   · 敏感字段的样例值漏进文档 → 设计文档会被打印、传阅、附在验收材料里
//
// 所以这里测的是「生成器还跟得上代码吗」，而不是「文档长什么样」。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  COLLECTION_NOTES,
  FIELD_NOTES,
  KNOWN_ENUMS,
  buildErDiagram,
  buildSchemaDoc,
  describeCollection,
} from "../server/db/schemaDoc.js";
import { FOREIGN_KEYS, INDEXES } from "../server/db/constraints.js";
import { SENSITIVE_COLLECTIONS } from "../server/db/roles.js";
import { createInitialData, normalizeDatabase } from "../server/storage.js";
import { createOaRequest, ensureOaTemplates } from "../server/oa.js";
import { initializeLedger } from "../server/ledgers.js";
import { generatePayrollBatch } from "../server/storage.js";

const db = createInitialData({ teacherCount: 30 });
normalizeDatabase(db);

// 种子数据里没有课次（要排课之后才产生），但课次是字段最多、外键最全的表，
// 也是文档里最需要说清楚的一张。造一批出来，否则测的是一张空表。
const term = db.terms.find((t) => t.current) || db.terms[0];
const klass = db.classes.find((c) => c.termId === term.id);
db.lessonInstances = Array.from({ length: 40 }, (_, i) => ({
  id: `L-${i}`,
  termId: term.id,
  termName: term.name,
  teacherId: db.teachers[i % db.teachers.length].id,
  classId: klass.id,
  className: klass.name,
  subjectId: "chinese",
  subjectName: "语文",
  roomId: klass.roomId,
  room: "教室01",
  date: `2026-06-${String((i % 28) + 1).padStart(2, "0")}`,
  time: "08:00-08:40",
  type: "regular",
  units: 1,
  status: i % 5 === 0 ? "completed" : "scheduled",
  durationMinutes: 40,
}));

// 账套与审批单是**按需创建**的集合，空库里根本不存在。但 KNOWN_ENUMS 里写着
// 它们的状态取值，一旦字段改名文档就会悄悄错位。用真实的建单路径造出来，
// 下面第 5 节的字段核对才是真的在核对，而不是被 length === 0 跳过去。
ensureOaTemplates(db);
createOaRequest(
  db,
  { id: "ACC-TEST", username: "tester", displayName: "测试教师", role: "teacher" },
  {
    templateKey: "leave",
    formData: {
      leaveType: "事假",
      startDate: "2026-06-01",
      endDate: "2026-06-02",
      days: 2,
      reason: "生成数据库设计文档的样本数据",
    },
  },
);
initializeLedger(db, { type: "scheduling", period: term.id, carryOver: false }, null);
initializeLedger(db, { type: "payroll", period: "2026-06", carryOver: false }, null);

// 工资单同理：不跑一次核算就没有 payrollDetails，文档里最敏感的那张表反而没被测到。
generatePayrollBatch(db, { month: "2026-06" }, {
  id: "ACC-TEST-FIN",
  username: "tester_fin",
  name: "测试财务",
  role: "system_admin",
});

// ---------------------------------------------------------------------------
// 1. 有数据的集合都要有业务注解
//
// 机械部分（字段名、类型）永远不会说谎，但一张只有字段名的表对校方毫无意义。
// 加了新集合忘了写注解，文档里就多一张来路不明的表。
// ---------------------------------------------------------------------------
{
  const withData = Object.keys(db).filter((k) => Array.isArray(db[k]) && db[k].length > 0);
  const missing = withData.filter((k) => !COLLECTION_NOTES[k]);
  assert.deepEqual(
    missing,
    [],
    `以下集合有数据却没有业务注解，请补 server/db/schemaDoc.js 的 COLLECTION_NOTES：${missing.join("、")}`,
  );

  // 注解本身要完整
  Object.entries(COLLECTION_NOTES).forEach(([key, meta]) => {
    assert.ok(meta.domain, `${key} 缺业务域`);
    assert.ok(meta.label, `${key} 缺中文表名`);
    assert.ok(meta.note && meta.note.length >= 8, `${key} 的说明太短，校方看不出这张表是干什么的`);
    assert.ok(
      ["人事", "排课", "薪资", "系统"].includes(meta.domain),
      `${key} 的业务域「${meta.domain}」不在三大模块 + 系统之内`,
    );
  });
}

// ---------------------------------------------------------------------------
// 2. 外键与索引涉及的表都必须被文档覆盖
// ---------------------------------------------------------------------------
{
  const documented = new Set(Object.keys(COLLECTION_NOTES));
  FOREIGN_KEYS.forEach((fk) => {
    assert.ok(documented.has(fk.child), `外键子表 ${fk.child} 未出现在文档注解里`);
    assert.ok(documented.has(fk.parent), `外键父表 ${fk.parent} 未出现在文档注解里`);
  });
  INDEXES.forEach((i) => {
    assert.ok(documented.has(i.collection), `建了索引的 ${i.collection} 未出现在文档注解里`);
  });
}

// ---------------------------------------------------------------------------
// 3. 敏感字段绝不能出样例值
//
// 设计文档会被打印、传阅、作为验收材料留存。密文样例本身泄露不了明文，
// 但口令散列一旦流出就是离线爆破的靶子。
// ---------------------------------------------------------------------------
{
  const accounts = describeCollection("accounts", db.accounts);
  const hash = accounts.fields.find((f) => f.name === "passwordHash");
  assert.ok(hash, "账号表应有口令散列字段");
  assert.equal(hash.sample, "（敏感，略）", "口令散列不得出样例值");
  assert.ok(hash.constraints.includes("加密存储"), "应标注为加密存储");
  assert.equal(hash.enumValues, "", "敏感字段不得列举取值");

  // 整份文档里不能出现任何真实散列
  const doc = buildSchemaDoc(db);
  const dumped = JSON.stringify(doc);
  const realHash = db.accounts[0].passwordHash;
  assert.ok(realHash, "样本账号应有散列");
  assert.ok(!dumped.includes(realHash), "文档数据里不得出现真实的口令散列");
}

// ---------------------------------------------------------------------------
// 4. 类型与约束要推断正确
// ---------------------------------------------------------------------------
{
  const lessons = describeCollection("lessonInstances", db.lessonInstances);
  const byName = new Map(lessons.fields.map((f) => [f.name, f]));

  assert.equal(byName.get("id").constraints.includes("主键"), true);
  assert.equal(byName.get("date").type, "日期", "YYYY-MM-DD 应识别为日期而不是笼统的字符串");
  assert.ok(
    byName.get("teacherId").constraints.some((c) => c.startsWith("外键")),
    "teacherId 有外键，文档必须标出来——这是验收 7.5「三域统一关联」的证据",
  );
  assert.ok(byName.get("date").constraints.includes("已建索引"), "date 已建索引，应标注");
  assert.ok(byName.get("units").type.includes("数字"));

  // 出现率：必填字段应是 100%
  assert.equal(byName.get("id").presence, 100);
}

// ---------------------------------------------------------------------------
// 5. 枚举说明必须与代码一致
//
// 这是最容易悄悄错位的地方：代码里加了一个新状态，文档里的枚举说明还是旧的，
// 校方按文档核对就会发现对不上。
// ---------------------------------------------------------------------------
{
  // 已知枚举优先于数据推断——样本里全是 active，不代表 status 只能是 active
  const employees = describeCollection("employees", db.employees);
  const status = employees.fields.find((f) => f.name === "status");
  assert.match(status.enumValues, /active/, "应列出合法取值");
  assert.match(status.enumValues, /left/, "离职状态在样本里可能不存在，但必须写进文档");

  // 日期/月份类字段不得被当成枚举。
  //
  // 最危险的是**只有一个取值**的那种：一次核算生成的工资单，month 全是 2026-06，
  // 完全满足枚举的判定条件，于是文档里写「取值：2026-06」——校方会以为这个字段
  // 只能填这一个月。用课次的 date 测不出来，它有 28 个不同日期，会被「取值太多
  // 不算枚举」那条规则顺手兜住，测的其实不是日期守卫。
  const payroll = describeCollection("payrollDetails", db.payrollDetails);
  const month = payroll.fields.find((f) => f.name === "month");
  assert.ok(month, "工资单应有核算月份字段");
  assert.equal(month.type, "月份", "YYYY-MM 应识别为月份");
  assert.equal(
    new Set(db.payrollDetails.map((d) => d.month)).size,
    1,
    "这条断言的前提是样本里月份只有一个取值，否则测的就不是日期守卫了",
  );
  assert.equal(month.enumValues, "", "月份字段不能列举取值——文档会变成「这个字段只能填 2026-06」");

  const lessons = describeCollection("lessonInstances", db.lessonInstances);
  const date = lessons.fields.find((f) => f.name === "date");
  assert.equal(date.enumValues, "", "日期字段同样不能列举取值");

  // 代码里的枚举定义必须指向真实存在的集合与字段
  Object.keys(KNOWN_ENUMS).forEach((key) => {
    const [collection, field] = key.split(".");
    assert.ok(
      COLLECTION_NOTES[collection],
      `KNOWN_ENUMS 里的 ${collection} 不在 COLLECTION_NOTES 中，集合名可能拼错了`,
    );
    const rows = Array.isArray(db[collection]) ? db[collection] : [];
    assert.ok(rows.length > 0, `${collection} 在测试库里是空的，${key} 的字段核对会被跳过——请造出样本数据`);
    assert.ok(
      rows.some((row) => field in (row || {})),
      `KNOWN_ENUMS 里的 ${key} 在真实数据中不存在，说明字段已改名或删除`,
    );
  });
}

// ---------------------------------------------------------------------------
// 6. ER 图要能反映真实的外键关系
// ---------------------------------------------------------------------------
{
  const doc = buildSchemaDoc(db);
  const er = buildErDiagram(doc.descriptions);
  assert.match(er, /^erDiagram/, "应为 Mermaid ER 图");

  // 每条外键都要在图上有对应的连线
  FOREIGN_KEYS.forEach((fk) => {
    assert.ok(
      er.includes(`${fk.parent} ||--o{ ${fk.child}`),
      `ER 图缺少 ${fk.parent} → ${fk.child} 的关系`,
    );
  });

  // 教师作为三域统一关联键，必须在图上连到人事、排课、薪资
  ["lessonInstances", "payrollDetails"].forEach((child) => {
    assert.ok(er.includes(`teachers ||--o{ ${child}`), `ER 图应体现 teachers → ${child}`);
  });
}

// ---------------------------------------------------------------------------
// 7. 敏感表、只追加表、账套归属的标记要与实际配置一致
// ---------------------------------------------------------------------------
{
  const doc = buildSchemaDoc(db);
  const byKey = new Map(doc.descriptions.map((d) => [d.key, d]));

  SENSITIVE_COLLECTIONS.forEach((key) => {
    if (byKey.has(key)) {
      assert.equal(byKey.get(key).sensitive, true, `${key} 是敏感表，文档必须标出来`);
    }
  });
  assert.equal(byKey.get("auditLogs")?.appendOnly, true, "审计日志应标为只追加");
  assert.equal(byKey.get("lessonInstances")?.unloadable, true, "课次应标为归档后不加载");
  assert.equal(byKey.get("lessonInstances")?.ledgerType, "scheduling", "课次属排课账套");
  assert.equal(byKey.get("payrollDetails")?.ledgerType, "payroll", "工资单属薪资账套");
  assert.equal(byKey.get("teachers")?.ledgerType, "", "教师是跨账套主数据，不属于任何一个账套");
}

// ---------------------------------------------------------------------------
// 8. 字段注解不能指向已经不存在的字段
//
// 不能拿种子数据来判断字段是否存在——合同、工资密文、会话令牌这些集合在空库里
// 本来就是空的，用「样本里没有」来判定「字段没了」会把一堆有效注解误杀。
// 真正的判据是**代码里还写不写这个字段名**：改名或删字段，源码里就没有了。
// ---------------------------------------------------------------------------
{
  const dir = new URL("../server/", import.meta.url);
  const entries = await fs.readdir(dir, { recursive: true });
  const files = entries
    .filter((f) => f.endsWith(".js"))
    // 必须排除 schemaDoc.js 本身：字段名就作为 FIELD_NOTES 的键写在里面，
    // 扫到自己就永远能匹配上，这条检查会变成永真式。
    .filter((f) => !f.endsWith("schemaDoc.js"));
  assert.ok(files.length > 10, "应扫到全部服务端源码");
  const sources = await Promise.all(files.map((f) => fs.readFile(new URL(f, dir), "utf-8")));
  const code = sources.join("\n");

  const stale = Object.keys(FIELD_NOTES).filter((f) => !new RegExp(`\\b${f}\\b`).test(code));
  assert.deepEqual(
    stale,
    [],
    `FIELD_NOTES 里有源码中已不存在的字段，说明注解没跟上代码改动：${stale.join("、")}`,
  );

  // 反过来：注解不能只是把字段名换个说法重复一遍，那对校方没有信息量
  Object.entries(FIELD_NOTES).forEach(([field, note]) => {
    assert.ok(note && note.length >= 2, `${field} 的说明太短`);
    assert.ok(note !== field, `${field} 的说明只是重复字段名`);
  });
}

console.log("db schema doc checks passed");
