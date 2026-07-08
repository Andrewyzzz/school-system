const MONEY_PRECISION = 100;
const SCHEME_VERSION = "fuyuan-dedicated-teacher-2026-v1";

export const DEFAULT_PAYROLL_RULES = {
  baseSalary: 6500,
  positionSalary: 1500,
  regular: 80,
  morning: 50,
  evening: 50,
  weekend: 120,
  makeup: 100,
  overtime: 60,
  taxThreshold: 5000,
  taxRate: 0.03,
  teacherSalaryScheme: {
    version: SCHEME_VERSION,
    settlementMode: "actualCompletedLessons",
    monthlyWeeks: 4.4,
    baseSalaryByQualification: {
      seniorProfessor: 3520,
      seniorTeacher: 3120,
      firstOrDoctor: 2920,
      secondOrMaster: 2720,
      thirdOrBachelor: 2620,
      ungradedOrJuniorCollege: 2520,
    },
    seniorityAllowance: {
      1: 100,
      2: 200,
      3: 300,
      4: 350,
      5: 400,
      6: 500,
    },
    housingAllowance: {
      chief: 2500,
      backboneOrGradeHead: 2300,
      teacher: 2100,
    },
    assessmentSalary: {
      high: 1180,
      middle: 3280,
      primaryCoreHigh: 3430,
      primaryCoreLow: 3330,
      primarySpecial: 3130,
    },
    stageLessonRules: {
      high: {
        regularBaseRate: 80,
        regularThresholdPerWeek: 12,
        regularExcessRate: 120,
        subjectCoefficients: {
          math: 1.2,
          default: 1,
        },
        morning: 40,
        evening: 35,
        makeupByGrade: {
          10: 110,
          11: 110,
          12: 130,
        },
        weekendByGrade: {
          10: 110,
          11: 110,
          12: 130,
        },
        substitute: 32,
      },
      middle: {
        regularBaseRate: 44,
        subjectCoefficients: {
          chinese: 1.3,
          math: 1.3,
          english: 1.3,
          physics: 1.2,
          chemistry: 1.2,
          politics: 1.2,
          history: 1.2,
          biology: 1.2,
          geography: 1.2,
          pe: 1.2,
          psychology: 1.2,
          default: 1,
        },
        evening: 20,
        activity: 18,
        makeupByGrade: {
          7: 40,
          8: 40,
          9: 50,
        },
        weekendByGrade: {
          7: 40,
          8: 40,
          9: 50,
        },
        substitute: 26,
      },
      primary: {
        regularBaseRate: 19,
        subjectCoefficients: {
          chinese: 1.2,
          math: 1.2,
          english: 1.2,
          science: 1.2,
          default: 1,
        },
        evening: 12,
        nonRegular: 9.5,
        makeup: 30,
        weekend: 30,
        substitute: 19,
      },
    },
    postAllowances: {
      high: {
        gradeHead: 6000,
        deputyGradeHead: 2000,
        homeroomPerStudent: 60,
        teachingResearchLeader: 1000,
        lessonPrepLeader: 1000,
        lessonPrepLargeGroup: 1400,
        graduateDegree: 1000,
        graduatingClass: 1000,
        eliteClass: 1000,
        qingbeiClass: 2000,
        busDuty: 0,
      },
      middle: {
        gradeHead: 4500,
        deputyGradeHead: 3500,
        subjectCenterDirector: 3000,
        lessonPrepLeader: 800,
        homeroomPerStudent: 50,
        graduatingClass: 900,
        busDuty: 0,
      },
      primary: {
        gradeHead: 2650,
        teachingResearchLeader: 750,
        teachingResearchDeputy: 650,
        lessonPrepHigh: 550,
        lessonPrepLow: 450,
        lessonPrepDeputy: 450,
        homeroomBase: 100,
        homeroomPerStudent: 30,
        firstGrade: 200,
        doubleChinese: 200,
        graduatingClass: 200,
        standardizedExam: 200,
        olympiadHomeroom: 800,
        busDuty: 0,
      },
    },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * MONEY_PRECISION) / MONEY_PRECISION;
}

export function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) return clone(defaults);
  const merged = clone(defaults);
  Object.entries(overrides).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      merged[key] &&
      typeof merged[key] === "object" &&
      !Array.isArray(merged[key])
    ) {
      merged[key] = deepMerge(merged[key], value);
    } else {
      merged[key] = value;
    }
  });
  return merged;
}

export function createDefaultPayrollRules() {
  return clone(DEFAULT_PAYROLL_RULES);
}

export function normalizePayrollRules(rules = {}) {
  const defaults = createDefaultPayrollRules();
  const merged = {
    ...defaults,
    ...(rules || {}),
  };
  merged.teacherSalaryScheme = deepMerge(
    defaults.teacherSalaryScheme,
    rules?.teacherSalaryScheme || {},
  );
  [
    "baseSalary",
    "positionSalary",
    "regular",
    "morning",
    "evening",
    "weekend",
    "makeup",
    "overtime",
    "taxThreshold",
    "taxRate",
  ].forEach((key) => {
    const value = Number(merged[key]);
    merged[key] = Number.isFinite(value) && value >= 0 ? value : defaults[key];
  });
  return merged;
}

function numberFromTeacherId(teacher = {}) {
  const matched = String(teacher.id || "").match(/(\d+)/);
  return matched ? Number.parseInt(matched[1], 10) : 1;
}

function qualificationFromTitle(title = "", seedIndex = 1) {
  if (title.includes("正高")) return "seniorProfessor";
  if (title.includes("高级")) return "seniorTeacher";
  if (title.includes("博士") || title.includes("一级") || title.includes("骨干")) return "firstOrDoctor";
  if (title.includes("硕士") || title.includes("二级")) return "secondOrMaster";
  if (title.includes("大专") || title.includes("未评级")) return "ungradedOrJuniorCollege";
  return seedIndex % 4 === 0 ? "secondOrMaster" : "thirdOrBachelor";
}

function schoolYearsFromHiredAt(hiredAt = "", fallback = 1) {
  const year = Number.parseInt(String(hiredAt).slice(0, 4), 10);
  if (!Number.isFinite(year)) return fallback;
  return Math.max(1, Math.min(12, 2026 - year));
}

function defaultAssessmentBand(teacher = {}) {
  if (teacher.stageId === "primary") {
    return ["pe", "music", "art", "information", "psychology"].includes(teacher.primarySubjectId)
      ? "primarySpecial"
      : "primaryCoreHigh";
  }
  return teacher.stageId;
}

export function defaultTeacherSalaryProfile(teacher = {}, seedIndex = null) {
  const index = seedIndex || numberFromTeacherId(teacher);
  const title = String(teacher.title || "");
  const isBackbone = title.includes("骨干");
  const isSenior = title.includes("高级") || title.includes("正高");
  const isHomeroom = index % 6 === 0;
  const gradeHead = index % 120 === 0;
  const deputyGradeHead = !gradeHead && index % 90 === 0;
  const lessonPrepLeader = index % 28 === 0;
  const teachingResearchLeader = !lessonPrepLeader && index % 45 === 0;
  const graduatingClass = [6, 9, 12].includes(Number(teacher.grade || 0)) || index % 18 === 0;

  return {
    version: SCHEME_VERSION,
    qualificationGrade: qualificationFromTitle(title, index),
    schoolYears: schoolYearsFromHiredAt(teacher.hiredAt, (index % 6) + 1),
    assessmentBand: defaultAssessmentBand(teacher),
    housingTier: isBackbone || gradeHead || deputyGradeHead ? "backboneOrGradeHead" : "teacher",
    probationRate: 1,
    roles: {
      homeroom: isHomeroom,
      homeroomStudentCount: isHomeroom ? 42 + (index % 6) : 0,
      gradeHead,
      deputyGradeHead,
      teachingResearchLeader,
      teachingResearchDeputy: false,
      lessonPrepLeader,
      lessonPrepLargeGroup: lessonPrepLeader && teacher.stageId === "high" && index % 56 === 0,
      lessonPrepDeputy: false,
      subjectCenterDirector: false,
      graduateDegree: isSenior && teacher.stageId === "high",
      graduatingClass,
      eliteClass: teacher.stageId === "high" && index % 40 === 0,
      qingbeiClass: teacher.stageId === "high" && index % 160 === 0,
      busDuty: false,
      firstGrade: teacher.stageId === "primary" && index % 40 === 0,
      doubleChinese: teacher.stageId === "primary" && teacher.primarySubjectId === "chinese" && index % 50 === 0,
      standardizedExam: teacher.stageId === "primary" && index % 30 === 0,
      olympiadHomeroom: teacher.stageId === "primary" && index % 100 === 0,
    },
    manualItems: isBackbone
      ? [
          {
            name: "名师/骨干补充项",
            amount: teacher.stageId === "high" ? 2000 : teacher.stageId === "middle" ? 1600 : 1000,
            basis: "第一阶段作为财务补充项录入，完整评审流程进入第三阶段",
            category: "supplement",
          },
        ]
      : [],
    attendanceDeduction: 0,
  };
}

export function ensureTeacherSalaryProfile(teacher, seedIndex = null) {
  if (!teacher) return false;
  const defaults = defaultTeacherSalaryProfile(teacher, seedIndex);
  const before = JSON.stringify(teacher.salaryProfile || null);
  const current = teacher.salaryProfile && typeof teacher.salaryProfile === "object" ? teacher.salaryProfile : {};
  teacher.salaryProfile = {
    ...defaults,
    ...current,
    version: current.version || defaults.version,
    roles: {
      ...defaults.roles,
      ...(current.roles || {}),
    },
    manualItems: Array.isArray(current.manualItems) ? current.manualItems : defaults.manualItems,
  };
  return before !== JSON.stringify(teacher.salaryProfile);
}

function coefficientFor(rule = {}, subjectId = "", grade = null) {
  const coefficients = rule.subjectCoefficients || {};
  if (subjectId === "science" && Number(grade) >= 4 && Number(grade) <= 6) return coefficients.science || 1;
  return coefficients[subjectId] || coefficients.default || 1;
}

function weekKey(dateKey = "") {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return String(dateKey).slice(0, 10);
  const dayIndex = date.getDay();
  const offset = dayIndex === 0 ? 6 : dayIndex - 1;
  date.setDate(date.getDate() - offset);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function rateFromGradeMap(map = {}, grade = null, fallback = 0) {
  const value = map?.[String(grade)];
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function lessonRateAndBasis({ lesson, teacher, scheme, highRegularWeekUnits, payable = false }) {
  const stageId = lesson.stageId || teacher.stageId;
  const subjectId = lesson.subjectId || teacher.primarySubjectId;
  const grade = Number(lesson.grade || teacher.grade || 0);
  const type = lesson.type || "regular";
  const stageRule = scheme.stageLessonRules?.[stageId] || {};
  const coefficient = coefficientFor(stageRule, subjectId, grade);
  const units = Number(lesson.units || 1);

  if (type === "regular") {
    if (stageId === "high") {
      const key = weekKey(lesson.date);
      const previousUnits = highRegularWeekUnits.get(key) || 0;
      const threshold = Number(stageRule.regularThresholdPerWeek || 12);
      const standardUnits = Math.max(0, Math.min(units, threshold - previousUnits));
      const excessUnits = Math.max(0, units - standardUnits);
      if (payable) highRegularWeekUnits.set(key, previousUnits + units);
      const standardRate = Number(stageRule.regularBaseRate || 0) * coefficient;
      const excessRate = Number(stageRule.regularExcessRate || stageRule.regularBaseRate || 0);
      const amount = roundMoney(standardUnits * standardRate + excessUnits * excessRate);
      const basis =
        excessUnits > 0
          ? `高中正课：${standardUnits} 节按 ${standardRate} 元，${excessUnits} 节超 12 节按 ${excessRate} 元`
          : `高中正课：${stageRule.regularBaseRate} 元 × 学科系数 ${coefficient}`;
      return {
        rate: units ? roundMoney(amount / units) : 0,
        amount,
        ruleName: excessUnits > 0 ? "高中正课超课时" : "高中正课",
        basis,
      };
    }

    const baseRate = Number(stageRule.regularBaseRate || 0);
    const rate = roundMoney(baseRate * coefficient);
    return {
      rate,
      amount: roundMoney(units * rate),
      ruleName: `${stageId === "middle" ? "初中" : "小学"}正课`,
      basis: `${stageId === "middle" ? "初中" : "小学"}正课：${baseRate} 元 × 学科系数 ${coefficient}`,
    };
  }

  if (type === "morning") {
    const rate = Number(stageRule.morning || stageRule.nonRegular || 0);
    return { rate, amount: roundMoney(units * rate), ruleName: "早自习", basis: `早自习 ${rate} 元/节` };
  }

  if (type === "evening") {
    const rate = Number(stageRule.evening || stageRule.nonRegular || 0);
    return { rate, amount: roundMoney(units * rate), ruleName: "晚自习", basis: `晚自习 ${rate} 元/节` };
  }

  if (type === "weekend") {
    const rate =
      rateFromGradeMap(stageRule.weekendByGrade, grade, stageRule.weekend || stageRule.makeup || 0);
    return { rate, amount: roundMoney(units * rate), ruleName: "周末补课", basis: `周末补课 ${rate} 元/节` };
  }

  if (type === "makeup") {
    const rate = rateFromGradeMap(stageRule.makeupByGrade, grade, stageRule.makeup || 0);
    return { rate, amount: roundMoney(units * rate), ruleName: "补课", basis: `补课 ${rate} 元/节` };
  }

  if (type === "substitute") {
    const rate = Number(stageRule.substitute || 0);
    return { rate, amount: roundMoney(units * rate), ruleName: "代课", basis: `代课 ${rate} 元/节` };
  }

  const fallbackRate = Number(stageRule.nonRegular || 0);
  return { rate: fallbackRate, amount: roundMoney(units * fallbackRate), ruleName: "其他课时", basis: `其他课时 ${fallbackRate} 元/节` };
}

function baseSalaryComponent(profile, scheme) {
  const amount = Number(scheme.baseSalaryByQualification?.[profile.qualificationGrade] || 0);
  return {
    name: "基本工资",
    basis: `职称/学历档：${profile.qualificationGrade}`,
    amount: roundMoney(amount * Number(profile.probationRate || 1)),
    category: "fixed",
  };
}

function assessmentComponent(teacher, profile, scheme) {
  const band = profile.assessmentBand || defaultAssessmentBand(teacher);
  const amount = Number(scheme.assessmentSalary?.[band] || 0);
  return {
    name: "考核工资",
    basis: `考核档：${band}`,
    amount,
    category: "fixed",
  };
}

function seniorityComponent(profile, scheme) {
  const years = Math.max(1, Math.floor(Number(profile.schoolYears || 1)));
  const tier = Math.min(years, 6);
  return {
    name: "校龄工资",
    basis: `校龄 ${years} 年，按 ${tier >= 6 ? "6 年及以上" : `${tier} 年`} 档`,
    amount: Number(scheme.seniorityAllowance?.[tier] || 0),
    category: "fixed",
  };
}

function housingComponent(profile, scheme) {
  const tier = profile.housingTier || "teacher";
  return {
    name: "住房补贴",
    basis: `住房补贴档：${tier}`,
    amount: Number(scheme.housingAllowance?.[tier] || 0),
    category: "allowance",
  };
}

function roleComponents(teacher, profile, scheme) {
  const stageId = teacher.stageId;
  const roles = profile.roles || {};
  const cfg = scheme.postAllowances?.[stageId] || {};
  const components = [];
  const push = (condition, name, amount, basis) => {
    if (condition && Number(amount)) {
      components.push({ name, basis, amount: roundMoney(amount), category: "allowance" });
    }
  };

  if (roles.homeroom) {
    const students = Number(roles.homeroomStudentCount || 0);
    const base = Number(cfg.homeroomBase || 0);
    const perStudent = Number(cfg.homeroomPerStudent || 0);
    push(true, "班主任津贴", base + students * perStudent, `${students} 人 × ${perStudent} 元${base ? ` + 固定 ${base} 元` : ""}`);
  }

  push(roles.gradeHead, "年级主任津贴", cfg.gradeHead, "按学段岗位津贴标准");
  push(roles.deputyGradeHead, "年级副主任津贴", cfg.deputyGradeHead, "按学段岗位津贴标准");
  push(roles.teachingResearchLeader, "教研组长津贴", cfg.teachingResearchLeader, "按学段岗位津贴标准");
  push(roles.teachingResearchDeputy, "教研副组长津贴", cfg.teachingResearchDeputy, "按学段岗位津贴标准");
  push(roles.lessonPrepLeader, "备课组长津贴", cfg.lessonPrepLargeGroup && roles.lessonPrepLargeGroup ? cfg.lessonPrepLargeGroup : cfg.lessonPrepLeader || cfg.lessonPrepHigh || cfg.lessonPrepLow, "按学段备课组岗位津贴标准");
  push(roles.lessonPrepDeputy, "备课副组长津贴", cfg.lessonPrepDeputy, "按学段岗位津贴标准");
  push(roles.subjectCenterDirector, "学科中心主任津贴", cfg.subjectCenterDirector, "按初中岗位津贴标准");
  push(roles.graduateDegree, "研究生学历津贴", cfg.graduateDegree, "高中研究生学历津贴");
  push(roles.graduatingClass, "毕业班津贴", cfg.graduatingClass, "毕业年级任课津贴");
  push(roles.eliteClass, "特优班津贴", cfg.eliteClass, "高中部特优班任课津贴");
  push(roles.qingbeiClass, "清北班津贴", cfg.qingbeiClass, "高中部清北班任课津贴");
  push(roles.busDuty, "跟车老师津贴", cfg.busDuty, "按学段跟车老师岗位津贴标准");
  push(roles.firstGrade, "一年级津贴", cfg.firstGrade, "小学一年级岗位津贴");
  push(roles.doubleChinese, "双班语文津贴", cfg.doubleChinese, "小学双班语文津贴");
  push(roles.standardizedExam, "统考津贴", cfg.standardizedExam, "小学统考科目津贴");
  push(roles.olympiadHomeroom, "奥数班主任津贴", cfg.olympiadHomeroom, "小学奥数班主任津贴");

  return components;
}

function manualComponents(profile) {
  const items = Array.isArray(profile.manualItems) ? profile.manualItems : [];
  const components = items
    .map((item, index) => {
      const rawCategory = item.category || (Number(item.amount) < 0 ? "deduction" : "supplement");
      const isDeduction = ["deduction", "attendanceDeduction"].includes(rawCategory) || Number(item.amount) < 0;
      return {
        name: item.name || `补充项 ${index + 1}`,
        basis: rawCategory === "attendanceDeduction" ? item.basis || "本月考勤扣减" : item.basis || "财务补充项",
        amount: isDeduction ? -Math.abs(roundMoney(item.amount)) : Math.abs(roundMoney(item.amount)),
        category: isDeduction ? "deduction" : "supplement",
      };
    })
    .filter((item) => item.amount);

  if (Number(profile.attendanceDeduction || 0) > 0) {
    components.push({
      name: "考勤人工扣减",
      basis: "第一阶段按财务人工扣减项处理",
      amount: -roundMoney(profile.attendanceDeduction),
      category: "deduction",
    });
  }

  return components;
}

export function calculateDedicatedTeacherPayroll({
  teacher,
  lessons = [],
  month = "2026-06",
  payrollRules = {},
  getRoomName = () => "",
  // 人事联动（第二阶段 M4）：离职/入职当月固定项按在职天数折算，1 表示不折算
  fixedProrationFactor = 1,
  prorationNote = "",
} = {}) {
  const normalizedRules = normalizePayrollRules(payrollRules);
  const scheme = normalizedRules.teacherSalaryScheme;
  const profile = {
    ...defaultTeacherSalaryProfile(teacher),
    ...(teacher.salaryProfile || {}),
    roles: {
      ...defaultTeacherSalaryProfile(teacher).roles,
      ...(teacher.salaryProfile?.roles || {}),
    },
  };
  const sortedLessons = [...lessons].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const highRegularWeekUnits = new Map();
  const lines = sortedLessons.map((lesson) => {
    const payable = lesson.status === "completed";
    const rule = lessonRateAndBasis({ lesson, teacher, scheme, highRegularWeekUnits, payable });
    return {
      lessonId: lesson.id,
      date: lesson.date,
      time: lesson.time,
      className: lesson.className,
      subjectName: lesson.subjectName,
      room: getRoomName(lesson),
      type: lesson.type,
      units: Number(lesson.units || 1),
      rate: rule.rate,
      ruleName: rule.ruleName,
      basis: rule.basis,
      status: lesson.status,
      amount: payable ? rule.amount : 0,
      payable,
    };
  });

  const lessonAmount = roundMoney(lines.reduce((sum, line) => sum + line.amount, 0));
  const prorate = Math.min(Math.max(Number(fixedProrationFactor) || 1, 0), 1);
  const fixedComponents = [
    baseSalaryComponent(profile, scheme),
    assessmentComponent(teacher, profile, scheme),
    seniorityComponent(profile, scheme),
    housingComponent(profile, scheme),
    ...roleComponents(teacher, profile, scheme),
    ...manualComponents(profile),
  ]
    .filter((component) => component.amount)
    .map((component) => {
      // 只折算固定月度项（fixed/allowance）：课时按实际完成结算、奖扣按实际录入不折算
      if (prorate >= 1 || !["fixed", "allowance"].includes(component.category)) return component;
      return {
        ...component,
        amount: roundMoney(component.amount * prorate),
        basis: `${component.basis}；${prorationNote || `按在职天数折算 ${Math.round(prorate * 100)}%`}`,
      };
    });
  const lessonComponent = {
    name: "课时工资",
    basis: "按实际完成课次、课型、学段、学科系数和高中超课时规则汇总",
    amount: lessonAmount,
    category: "lesson",
  };
  const components = [...fixedComponents, lessonComponent];
  const grossPay = roundMoney(components.reduce((sum, component) => sum + component.amount, 0));
  const tax = roundMoney(Math.max(grossPay - Number(normalizedRules.taxThreshold || 0), 0) * Number(normalizedRules.taxRate || 0));
  const netPay = roundMoney(grossPay - tax);
  const baseSalary = roundMoney(components.find((item) => item.name === "基本工资")?.amount || 0);
  const assessmentSalary = roundMoney(components.find((item) => item.name === "考核工资")?.amount || 0);
  const senioritySalary = roundMoney(components.find((item) => item.name === "校龄工资")?.amount || 0);
  const housingAllowance = roundMoney(components.find((item) => item.name === "住房补贴")?.amount || 0);
  const positionSalary = roundMoney(
    components
      .filter((item) => item.category === "allowance" && item.name !== "住房补贴")
      .reduce((sum, item) => sum + item.amount, 0),
  );
  const supplementalAmount = roundMoney(components.filter((item) => item.category === "supplement").reduce((sum, item) => sum + item.amount, 0));
  const deductionAmount = roundMoney(Math.abs(components.filter((item) => item.category === "deduction").reduce((sum, item) => sum + item.amount, 0)));

  return {
    teacher,
    month,
    salarySchemeVersion: scheme.version,
    salaryProfile: profile,
    baseSalary,
    assessmentSalary,
    senioritySalary,
    housingAllowance,
    positionSalary,
    supplementalAmount,
    deductionAmount,
    lessonAmount,
    grossPay,
    tax,
    netPay,
    components,
    lines,
  };
}
