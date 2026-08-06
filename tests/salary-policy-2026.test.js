// 0726 薪酬制度（修订稿）规则验证
// 覆盖：基本工资档、校龄四公式、考核浮动、试用期折算与最低工资兜底、
//       兼岗叠加/择高、年级长按班数、课时系数与补课费、跨头课与心理辅导
import assert from "node:assert/strict";
import {
  DEFAULT_PAYROLL_RULES,
  calculateDedicatedTeacherPayroll,
  seniorityAllowanceFor,
  applyProbationPolicy,
  applyPostAllowancePolicy,
} from "../server/payroll.js";

const scheme = DEFAULT_PAYROLL_RULES.teacherSalaryScheme;
const amountOf = (result, name) => result.components.find((item) => item.name === name)?.amount ?? null;

function baseTeacher(overrides = {}) {
  return {
    id: "T0001",
    name: "测试老师",
    stageId: "high",
    grade: 10,
    primarySubjectId: "math",
    title: "高级教师",
    hiredAt: "2020-09-01",
    ...overrides,
  };
}

function runPayroll({ teacher, profile = {}, lessons = [], ...rest }) {
  return calculateDedicatedTeacherPayroll({
    teacher: { ...teacher, salaryProfile: { ...profile, roles: profile.roles || {} } },
    lessons,
    month: "2026-09",
    payrollRules: DEFAULT_PAYROLL_RULES,
    ...rest,
  });
}

// ---------------------------------------------------------------- 基本工资档
{
  const b = scheme.baseSalaryByQualification;
  assert.equal(b.seniorProfessor, 3520, "正高基本工资应为 3520");
  assert.equal(b.seniorTeacher, 3320, "高级基本工资应为 3320");
  assert.equal(b.firstOrDoctor, 3120, "一级(博士)基本工资应为 3120");
  assert.equal(b.secondOrMaster, 2820, "二级(硕士)基本工资应为 2820");
  assert.equal(b.thirdOrBachelor, 2620, "三级基本工资应为 2620");
  assert.equal(b.ungradedOrJuniorCollege, 2520, "未评级基本工资应为 2520");
}

// ------------------------------------------------------------ 校龄津贴四公式
{
  const teacherRule = scheme.seniorityRules.teacher;
  // 制度：3 年及以内 = 校龄×100
  assert.equal(seniorityAllowanceFor(1, teacherRule).amount, 100);
  assert.equal(seniorityAllowanceFor(3, teacherRule).amount, 300);
  // 3 年以上 = 300 + (校龄-3)×50
  assert.equal(seniorityAllowanceFor(4, teacherRule).amount, 350);
  assert.equal(seniorityAllowanceFor(6, teacherRule).amount, 450, "第 6 年应为 450（旧表误给 500）");
  assert.equal(seniorityAllowanceFor(7, teacherRule).amount, 500);
  assert.equal(seniorityAllowanceFor(20, teacherRule).amount, 500, "封顶 500");
  // 不满一年不计
  assert.equal(seniorityAllowanceFor(0, teacherRule).amount, 0);
  assert.equal(seniorityAllowanceFor(2.9, teacherRule).amount, 200, "校龄取实数向下取整");
  // 生活教师：×50 封顶 300
  assert.equal(seniorityAllowanceFor(4, scheme.seniorityRules.lifeTeacher).amount, 200);
  assert.equal(seniorityAllowanceFor(10, scheme.seniorityRules.lifeTeacher).amount, 300, "生活教师封顶 300");
  // 司机/食堂：×20 封顶 500
  assert.equal(seniorityAllowanceFor(10, scheme.seniorityRules.driver).amount, 200);
  assert.equal(seniorityAllowanceFor(30, scheme.seniorityRules.canteen).amount, 500);
}

// -------------------------------------------------------------- 考核工资浮动
{
  const teacher = baseTeacher();
  const normal = runPayroll({ teacher, profile: { assessmentBand: "high" } });
  assert.equal(amountOf(normal, "考核工资"), 1480, "高中考核工资标准应为 1480");

  const excellent = runPayroll({
    teacher,
    profile: { assessmentBand: "high" },
    monthlyAssessment: { grade: "excellent" },
  });
  assert.equal(amountOf(excellent, "考核工资"), 1776, "优秀应上浮 1.2 倍");

  const unqualified = runPayroll({
    teacher,
    profile: { assessmentBand: "high" },
    monthlyAssessment: { grade: "unqualified" },
  });
  assert.equal(amountOf(unqualified, "考核工资"), 888, "不合格应梯度扣减至 0.6");

  // 区间制岗位（幼儿园）：直接指定金额覆盖系数
  const override = runPayroll({
    teacher,
    profile: { assessmentBand: "high" },
    monthlyAssessment: { amount: 1620 },
  });
  assert.equal(amountOf(override, "考核工资"), 1620, "指定金额应覆盖系数计算");
}

// -------------------------------------------- 试用期 80% 折算与最低工资兜底
{
  const components = [
    { name: "基本工资", basis: "b", amount: 3320, category: "fixed" },
    { name: "课时工资", basis: "l", amount: 2000, category: "lesson" },
  ];
  const full = applyProbationPolicy(components, { probationRate: 0.8 }, scheme);
  assert.equal(full.reduce((s, i) => s + i.amount, 0), 4256, "scope=all 应折算全部项");
  assert.ok(full[0].basis.includes("试用期按 80% 计发"), "应在依据中标注试用期折算");

  const fixedOnly = applyProbationPolicy(
    components,
    { probationRate: 0.8 },
    { ...scheme, probationRule: { ...scheme.probationRule, scope: "fixed" } },
  );
  assert.equal(fixedOnly[0].amount, 2656, "scope=fixed 应折算固定项");
  assert.equal(fixedOnly[1].amount, 2000, "scope=fixed 不应折算课时工资");

  // 低于最低工资应补足
  const low = applyProbationPolicy(
    [{ name: "基本工资", basis: "b", amount: 2520, category: "fixed" }],
    { probationRate: 0.8 },
    scheme,
  );
  const total = low.reduce((s, i) => s + i.amount, 0);
  assert.equal(total, 2520, "折算后低于最低工资应补足到 2520");
  assert.ok(low.some((i) => i.name === "最低工资补足"), "应出现最低工资补足项");

  // 非试用期不受影响
  assert.equal(applyProbationPolicy(components, { probationRate: 1 }, scheme), components);
}

// ------------------------------------------------------ 兼岗叠加 vs 行政择高
{
  const items = [
    { name: "班主任津贴", basis: "b", amount: 2600, category: "allowance" },
    { name: "教研组长津贴", basis: "b", amount: 1000, category: "allowance" },
    { name: "备课组长津贴", basis: "b", amount: 1400, category: "allowance" },
  ];
  // 授课教师：叠加
  const stacked = applyPostAllowancePolicy(items, {});
  assert.equal(stacked.length, 3, "教师兼岗津贴应全部叠加");
  assert.equal(stacked.reduce((s, i) => s + i.amount, 0), 5000);

  // 行政管理人员：择最高一项
  const highest = applyPostAllowancePolicy(items, { postAllowanceMode: "highest" });
  assert.equal(highest.length, 1, "行政人员兼岗应择高只留一项");
  assert.equal(highest[0].amount, 2600, "应保留金额最高项");
  assert.ok(highest[0].basis.includes("择高发放"), "应说明择高并列出未计项");
}

// ------------------------------------------------------------ 年级长按班数算
{
  const teacher = baseTeacher();
  const result = runPayroll({
    teacher,
    profile: { roles: { gradeHead: true, gradeClassCount: 12 } },
  });
  // 制度：班数 × 300 + 300
  assert.equal(amountOf(result, "年级主任津贴"), 3900, "高中年级长应为 12×300+300");

  const middleResult = runPayroll({
    teacher: baseTeacher({ stageId: "middle", grade: 7 }),
    profile: { roles: { gradeHead: true, gradeClassCount: 10 } },
  });
  assert.equal(amountOf(middleResult, "年级主任津贴"), 3300, "初中年级长应为 10×300+300");

  // 小学仍为固定标准
  const primaryResult = runPayroll({
    teacher: baseTeacher({ stageId: "primary", grade: 3, primarySubjectId: "chinese" }),
    profile: { roles: { gradeHead: true } },
  });
  assert.equal(amountOf(primaryResult, "年级主任津贴"), 2650, "小学年级长为固定 2650");
}

// -------------------------------------------------------------- 班主任津贴
{
  const high = runPayroll({
    teacher: baseTeacher(),
    profile: { roles: { homeroom: true, homeroomStudentCount: 45 } },
  });
  assert.equal(amountOf(high, "班主任津贴"), 45 * 60 + 500, "高中班主任 60 元/生 + 500 元/月");

  const middle = runPayroll({
    teacher: baseTeacher({ stageId: "middle", grade: 8 }),
    profile: { roles: { homeroom: true, homeroomStudentCount: 50 } },
  });
  assert.equal(amountOf(middle, "班主任津贴"), 2500, "初中班主任 50 元/生，无月固定额");

  const primary = runPayroll({
    teacher: baseTeacher({ stageId: "primary", grade: 3, primarySubjectId: "chinese" }),
    profile: { roles: { homeroom: true, homeroomStudentCount: 40 } },
  });
  assert.equal(amountOf(primary, "班主任津贴"), 40 * 30 + 100, "小学班主任 30 元/生 + 100 元/月");
}

// ---------------------------------------------------------- 课时系数与单价
{
  const rules = scheme.stageLessonRules;
  // 高中：数学 1.2、其他高考科目 1.0、非统考 0.9
  assert.equal(rules.high.subjectCoefficients.math, 1.2);
  assert.equal(rules.high.subjectCoefficients.chinese, 1);
  assert.equal(rules.high.subjectCoefficients.default, 0.9, "高中非统考科目应为 0.9");
  assert.equal(rules.high.regularBaseRate, 80);
  assert.equal(rules.high.regularThresholdPerWeek, 0, "制度未设超课时加价档");
  // 高中补课费：正课 100，毕业年级 120
  assert.equal(rules.high.makeupByGrade[10], 100);
  assert.equal(rules.high.makeupByGrade[12], 120, "毕业年级补课费 120");
  // 跨头课按月、心理辅导 50%
  assert.equal(rules.high.crossGradeMonthly, 500);
  assert.equal(rules.high.psychologyLessonRate, 0.5);
  // 初中：生物地理美术音乐心理为 1（原误设 1.2）
  assert.equal(rules.middle.subjectCoefficients.chinese, 1.3);
  assert.equal(rules.middle.subjectCoefficients.physics, 1.2);
  assert.equal(rules.middle.subjectCoefficients.biology, 1, "初中生物系数应为 1");
  assert.equal(rules.middle.subjectCoefficients.geography, 1, "初中地理系数应为 1");
  assert.equal(rules.middle.subjectCoefficients.psychology, 1, "初中心理健康系数应为 1");
  assert.equal(rules.middle.regularBaseRate, 44);
  // 小学
  assert.equal(rules.primary.regularBaseRate, 19);
  assert.equal(rules.primary.evening, 12);
  assert.equal(rules.primary.nonRegular, 9.5);
}

// ------------------------------------------------------ 住房补贴与考核标准
{
  assert.equal(scheme.housingAllowance.teacher, 2100, "专任教师住房补贴统一 2100");
  assert.equal(scheme.housingAllowance.chief, 3000, "校级领导住房补贴 3000");
  assert.equal(scheme.assessmentSalary.high, 1480, "高中考核工资应为 1480");
  assert.equal(scheme.assessmentSalary.middle, 3280);
  assert.equal(scheme.assessmentSalary.primaryCoreHigh, 3430);
}

// -------------------------------------------------------------- 学历补贴开关
{
  const teacher = baseTeacher();
  const off = runPayroll({ teacher, profile: { degree: "doctor" } });
  assert.equal(amountOf(off, "学历补贴"), null, "默认不叠加学历补贴（待学校确认）");

  const on = calculateDedicatedTeacherPayroll({
    teacher: { ...teacher, salaryProfile: { degree: "doctor", roles: {} } },
    lessons: [],
    month: "2026-09",
    payrollRules: {
      ...DEFAULT_PAYROLL_RULES,
      teacherSalaryScheme: {
        ...scheme,
        degreeAllowance: { master: 500, doctor: 800 },
      },
    },
  });
  assert.equal(on.components.find((i) => i.name === "学历补贴")?.amount, 800, "开启后博士补贴 800");
}

console.log("salary policy 2026 checks passed");
