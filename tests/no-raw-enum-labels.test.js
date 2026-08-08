// 界面不得出现内部枚举
//
// 起因：工资单上印着「职称档：third」「考核档 primaryCoreHigh」，组织树上印着
// 「排课:primary」。改掉具体几处不解决问题——只要还有代码路径把枚举原样拼进
// 展示文案，下次照样漏。
//
// 这个测试从两侧同时卡：
//   1) 数据侧：扫全库所有面向用户的文本字段，中文串里不得夹带内部枚举；
//   2) 代码侧：扫 app.js / server 的模板字符串，禁止把已知枚举字段直接插值到
//      展示文本里，也禁止 LABELS[x] || x 这种"缺译名就漏英文"的兜底。
//
// 新增枚举时，把它的译名登记到对应的 LABELS 表即可，不必改这个测试。
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialData, normalizeDatabase } from "../server/storage.js";
import {
  ASSESSMENT_BAND_LABELS,
  HOUSING_TIER_LABELS,
  QUALIFICATION_GRADE_LABELS,
  assessmentBandLabel,
  housingTierLabel,
  qualificationGradeLabel,
} from "../server/payroll.js";

// ---------------------------------------------------------------------------
// 1. 译名表完整性：每个枚举值都要有中文名，且译名本身不能是英文
// ---------------------------------------------------------------------------
{
  const tables = [
    ["职称档", QUALIFICATION_GRADE_LABELS],
    ["考核档", ASSESSMENT_BAND_LABELS],
    ["住房补贴档", HOUSING_TIER_LABELS],
  ];
  tables.forEach(([name, table]) => {
    const entries = Object.entries(table);
    assert.ok(entries.length > 0, `${name}译名表不应为空`);
    entries.forEach(([key, label]) => {
      assert.ok(label, `${name} 的 ${key} 缺译名`);
      assert.match(label, /[一-龥]/, `${name} 的 ${key} 译名「${label}」不是中文`);
    });
  });

  // 取值函数对每个枚举都返回中文
  Object.keys(QUALIFICATION_GRADE_LABELS).forEach((key) => {
    assert.match(qualificationGradeLabel(key), /[一-龥]/, `职称档 ${key} 未译出中文`);
  });
  Object.keys(ASSESSMENT_BAND_LABELS).forEach((key) => {
    assert.match(assessmentBandLabel(key), /[一-龥]/, `考核档 ${key} 未译出中文`);
  });
  Object.keys(HOUSING_TIER_LABELS).forEach((key) => {
    assert.match(housingTierLabel(key), /[一-龥]/, `住房档 ${key} 未译出中文`);
  });

  // 旧库遗留的职称键（曾与学历绑定）也要能译出来，否则历史工资单会显示英文
  ["firstOrDoctor", "secondOrMaster", "thirdOrBachelor", "ungradedOrJuniorCollege"].forEach((legacy) => {
    assert.match(qualificationGradeLabel(legacy), /[一-龥]/, `遗留职称键 ${legacy} 未译出中文`);
  });
}

// ---------------------------------------------------------------------------
// 2. 数据侧：全新一套数据跑完整链路后，面向用户的文本不得夹带枚举
// ---------------------------------------------------------------------------
// 会出现在界面/工资条上的字段。内部 id、key、className 不在此列。
const USER_FACING_FIELDS = [
  "basis",
  "ruleName",
  "label",
  "text",
  "title",
  "summary",
  "message",
  "reason",
  "note",
  "description",
  "statusLabel",
  "actionLabel",
  "scopeName",
  "stageName",
];

// 系统内部枚举值。出现在中文文案里即为漏译。
const INTERNAL_ENUMS = [
  ...Object.keys(QUALIFICATION_GRADE_LABELS),
  ...Object.keys(ASSESSMENT_BAND_LABELS),
  ...Object.keys(HOUSING_TIER_LABELS),
  "primary",
  "middle",
  "high",
  "firstOrDoctor",
  "secondOrMaster",
  "thirdOrBachelor",
  "ungradedOrJuniorCollege",
];
const ENUM_IN_TEXT = new RegExp(`(^|[^A-Za-z])(${INTERNAL_ENUMS.join("|")})([^A-Za-z]|$)`);

function scanForEnums(db) {
  const found = [];
  const walk = (node, path) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach((item) => walk(item, path));
    Object.entries(node).forEach(([key, value]) => {
      if (typeof value === "string" && USER_FACING_FIELDS.includes(key)) {
        // 只查中文文案：纯英文字段多半是内部标识，不面向用户
        if (/[一-龥]/.test(value) && ENUM_IN_TEXT.test(value)) {
          found.push(`${path}.${key} = ${value.slice(0, 60)}`);
        }
      }
      if (value && typeof value === "object") walk(value, path);
    });
  };
  Object.entries(db).forEach(([collection, rows]) => {
    if (Array.isArray(rows)) walk(rows, collection);
  });
  return found;
}

{
  const db = createInitialData({ teacherCount: 30 });
  normalizeDatabase(db);
  const leaks = scanForEnums(db);
  assert.deepEqual(leaks, [], `种子数据的展示文案里夹带内部枚举：\n  ${leaks.join("\n  ")}`);
}

// ---------------------------------------------------------------------------
// 3. 代码侧：禁止把枚举字段直接插值进展示文本
// ---------------------------------------------------------------------------
{
  const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const payrollSource = readFileSync(new URL("../server/payroll.js", import.meta.url), "utf8");

  // 展示学段必须走 stageLabel()，不能直接插 stageId
  const rawStage = [...appSource.matchAll(/<span[^>]*>[^<]*\$\{escapeHtml\((\w+)\.stageId\)\}/g)];
  assert.deepEqual(
    rawStage.map((m) => m[0].slice(0, 60)),
    [],
    "界面上直接渲染了 stageId，应改用 stageLabel()",
  );

  // 工资单口径不能直接插枚举变量
  const rawBasis = [
    ...payrollSource.matchAll(/basis: `[^`]*\$\{(grade|band|tier|degree)\}/g),
  ];
  assert.deepEqual(
    rawBasis.map((m) => m[0]),
    [],
    "工资单 basis 直接拼了枚举变量，应改用 xxxLabel()",
  );

  // 前端三张档位译名表必须与后端一致，避免同一枚举两套译名
  [
    ["salaryQualificationLabels", QUALIFICATION_GRADE_LABELS],
    ["salaryAssessmentLabels", ASSESSMENT_BAND_LABELS],
    ["salaryHousingLabels", HOUSING_TIER_LABELS],
  ].forEach(([frontName, backTable]) => {
    const start = appSource.indexOf(`const ${frontName} = {`);
    assert.ok(start > 0, `app.js 应存在 ${frontName}`);
    const block = appSource.slice(start, appSource.indexOf("\n};", start));
    Object.entries(backTable).forEach(([key, label]) => {
      if (!key) return; // 空串键（本科及以下）不在前端表里
      assert.ok(block.includes(`${key}:`), `${frontName} 缺少 ${key}，界面会显示英文枚举`);
      assert.ok(
        block.includes(`"${label}"`),
        `${frontName} 里 ${key} 的译名与后端不一致（后端为「${label}」）`,
      );
    });
  });
}

// ---------------------------------------------------------------------------
// 4. 遗留键只用于展示，不得混进薪资配置表单
//
// 薪资配置页遍历译名表的键来渲染输入框。把「一级/博士」这类旧键合并进
// salaryQualificationLabels，配置页就会多出一套值为 0 的重复档位。
// ---------------------------------------------------------------------------
{
  const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const LEGACY_KEYS = ["firstOrDoctor", "secondOrMaster", "thirdOrBachelor", "ungradedOrJuniorCollege"];

  const start = appSource.indexOf("const salaryQualificationLabels = {");
  const block = appSource.slice(start, appSource.indexOf("\n};", start));
  LEGACY_KEYS.forEach((key) => {
    assert.ok(
      !block.includes(`${key}:`),
      `salaryQualificationLabels 不应含遗留键 ${key}，否则薪资配置页会多出一套重复档位；` +
        "遗留键请放在 legacyQualificationLabels 里，只用于展示历史数据",
    );
  });

  // 但历史文案的兜底翻译必须带上遗留键，否则旧工资单会显示英文
  assert.ok(appSource.includes("const legacyQualificationLabels = {"), "应保留 legacyQualificationLabels 供历史数据展示");
  LEGACY_KEYS.forEach((key) => {
    assert.ok(
      appSource.slice(appSource.indexOf("const legacyQualificationLabels = {")).includes(`${key}:`),
      `legacyQualificationLabels 缺少 ${key}，旧工资单会显示英文`,
    );
  });
  assert.match(
    appSource,
    /humanizePayrollBasis[\s\S]{0,300}legacyQualificationLabels/,
    "历史工资单文案的兜底翻译必须包含遗留职称键",
  );

  // 学历补贴要有配置入口：制度规定硕士 500、博士 800，财务需要能调
  assert.ok(appSource.includes("const salaryDegreeLabels = {"), "应有学历补贴译名表");
  assert.match(
    appSource,
    /path: "degreeAllowance"/,
    "薪资配置页应有学历补贴（degreeAllowance）配置区块，否则硕士/博士补贴改不了",
  );
}

console.log("no raw enum label checks passed");
