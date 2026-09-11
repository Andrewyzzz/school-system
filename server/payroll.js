const MONEY_PRECISION = 100;
// 方案版本：随薪酬制度修订递增。存量库中的旧版本方案会在 normalizePayrollRules 中
// 自动升级到本版制度标准（见 upgradeSchemeToCurrentPolicy），避免"改了代码但库里还是旧标准"。
const SCHEME_VERSION = "fuyuan-policy-2026-09";
const LEGACY_SCHEME_VERSIONS = new Set(["fuyuan-dedicated-teacher-2026-v1"]);

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
    // 基本工资按【职称】档（0726 制度第二章·二）
    // 注意：职称与学历互不绑定——一级职称不等于博士、二级职称不等于硕士，
    // 学历另按 degreeAllowance 单独发放补贴，两者可同时享受。
    baseSalaryByQualification: {
      seniorProfessor: 3520,
      seniorTeacher: 3320,
      first: 3120,
      second: 2820,
      third: 2620,
      ungraded: 2520,
    },
    // 学历补贴（制度：硕士 500 元/月、博士 800 元/月），与职称档并行发放
    degreeAllowance: {
      master: 500,
      doctor: 800,
    },
    // 试用期工资（制度第六条）：转正后工资的 80%，不低于深圳市最低工资标准
    // scope 待学校确认（澄清项 C6）：all=全部薪酬项，fixed=仅固定项与津贴
    // 兼容旧账套的兜底值；实际统一从下方 minimumWage 读取。
    probationRule: {
      scope: "all",
      minimumWage: 2700,
    },
    // 全校统一维护的最低工资标准。当前由学校确认是 2700 元/月。
    minimumWage: 2700,
    // 校龄津贴（制度第二章各岗位方案「校龄津贴」条）。校龄取实数：进校满一年才算一年。
    //   专任教师、校医：3 年及以内 校龄×100；3 年以上 300+(校龄-3)×50；封顶 500 元/月
    //   生活教师：      校龄×50，封顶 300 元/月
    //   司机：          校龄×20，封顶 500 元/月
    //   食堂等后勤职工：制度未设校龄津贴（工资=基本+岗位+考核+加班+住房），故不列
    // tiered：≤tier1Years 按 校龄×tier1Rate；超出按 tier2Base+(校龄-tier1Years)×tier2Rate
    // flat：  校龄×flatRate
    // 两种模式都按 cap 封顶。以上参数均可在薪资配置页调整。
    seniorityRules: {
      teacher: { mode: "tiered", tier1Years: 3, tier1Rate: 100, tier2Base: 300, tier2Rate: 50, cap: 500 },
      medical: { mode: "tiered", tier1Years: 3, tier1Rate: 100, tier2Base: 300, tier2Rate: 50, cap: 500 },
      lifeTeacher: { mode: "flat", flatRate: 50, cap: 300 },
      driver: { mode: "flat", flatRate: 20, cap: 500 },
    },
    housingAllowance: {
      // 专任教师：制度规定小初高统一 2100 元/月，不分骨干/年级长
      teacher: 2100,
      // 以下为行政干部住房补贴分档（制度第二章·一·三），供行政方案使用
      chief: 3000,
      middleManager: 2800,
      otherAdmin: 2500,
    },
    assessmentSalary: {
      kindergarten: 3130,
      high: 1480,
      middle: 3280,
      primaryCoreHigh: 3430,
      primaryCoreLow: 3330,
      primarySpecial: 3130,
    },
    // 月度考核由工资核算员按分数录入：100 分即全额，分数直接就是百分比系数。
    // 例如 120 分 = 120%，80 分 = 80%。不再使用优秀/合格等等级档。
    stageLessonRules: {
      kindergarten: {
        regularBaseRate: 19,
        subjectCoefficients: { chinese: 1.2, math: 1.2, english: 1.2, default: 1 },
        nonRegular: 9.5,
        makeup: 30,
        weekend: 30,
        substitute: 19,
      },
      high: {
        regularBaseRate: 80,
        // 0726 制度未设超课时加价档，置 0 表示不启用（保留配置能力以备学校恢复）
        regularThresholdPerWeek: 0,
        regularExcessRate: 0,
        // 制度：数学 1.2；其他高考科目 1.0；非统考科目 0.9
        subjectCoefficients: {
          math: 1.2,
          chinese: 1,
          english: 1,
          physics: 1,
          chemistry: 1,
          biology: 1,
          politics: 1,
          history: 1,
          geography: 1,
          default: 0.9,
        },
        morning: 40,
        evening: 35,
        // 跨头课补助：按月固定，不按节计（制度：500 元/月）
        crossGradeMonthly: 500,
        // 心理辅导按所任课时量的 50% 计算
        psychologyLessonRate: 0.5,
        // 补课费：正课 100 元/节，毕业年级 120 元/节
        makeupByGrade: {
          10: 100,
          11: 100,
          12: 120,
        },
        makeupEvening: 35,
        weekendByGrade: {
          10: 100,
          11: 100,
          12: 120,
        },
        substitute: 32,
      },
      middle: {
        regularBaseRate: 44,
        // 制度：语数英 1.3；物理化学政治历史体育 1.2；生物地理美术音乐心理健康 1
        subjectCoefficients: {
          chinese: 1.3,
          math: 1.3,
          english: 1.3,
          physics: 1.2,
          chemistry: 1.2,
          politics: 1.2,
          history: 1.2,
          pe: 1.2,
          biology: 1,
          geography: 1,
          art: 1,
          music: 1,
          psychology: 1,
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
        // 年级长：班数 × 300 + 300（制度改为按管辖班级数动态计算）
        gradeHeadPerClass: 300,
        gradeHeadBase: 300,
        gradeHead: 0,
        deputyGradeHead: 0,
        // 班主任：60 元/生 + 500 元/月
        homeroomBase: 500,
        homeroomPerStudent: 60,
        teachingResearchLeader: 1000,
        // 备课组长：语数外 1400，其他 1000
        lessonPrepLeader: 1000,
        lessonPrepLargeGroup: 1400,
        graduateDegree: 0,
        graduatingClass: 1000,
        eliteClass: 1000,
        qingbeiClass: 2000,
        busDuty: 0,
      },
      middle: {
        // 年级长：班数 × 300 + 300
        gradeHeadPerClass: 300,
        gradeHeadBase: 300,
        gradeHead: 0,
        deputyGradeHead: 0,
        teachingResearchLeader: 3000,
        subjectCenterDirector: 0,
        lessonPrepLeader: 800,
        homeroomPerStudent: 50,
        // 毕业班统考科目任课教师（干部）
        graduatingClass: 900,
        busDuty: 0,
      },
      primary: {
        // 小学年级长为固定标准（制度未改为按班数）
        gradeHead: 2650,
        // 教研组长：主科 750 / 副科 650
        teachingResearchLeader: 750,
        teachingResearchDeputy: 650,
        // 备课组长：主科高段 550 / 主科低段 450 / 副科 450 / 统考年级 1000
        lessonPrepHigh: 550,
        lessonPrepLow: 450,
        lessonPrepDeputy: 450,
        lessonPrepStandardizedGrade: 1000,
        // 班主任：30 元/生 + 100 元/月
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
    // 生活教师独立工资方案（0726 制度第二章·三）。
    // 人事档案只维护谁是生活教师、负责学生人数和兼岗；标准金额统一由总校财务在
    // 薪资配置维护，避免把制度金额散落在个人档案里。
    lifeTeacher: {
      baseSalary: 2520,
      workloadByStage: {
        primary: { perStudent: 10, cap: 600 },
        middle: { perStudent: 14, cap: 1000 },
        high: { perStudent: 18, cap: 1260 },
      },
      assessmentByStage: {
        primary: { lower: 810, upper: 850, night: 1130 },
        middle: { standard: 1610, night: 1440 },
        high: { standard: 1810, night: 1530 },
      },
      postAllowancesByStage: {
        primary: { lifeManager: 600, buildingLead: 300, nightShiftLead: 200, primaryDayShift: 300 },
        middle: { lifeManager: 2390, buildingLead: 800, nightShiftLead: 0, primaryDayShift: 0 },
        high: { lifeManager: 1000, buildingLead: 600, nightShiftLead: 0, primaryDayShift: 0 },
      },
      transportAllowance: { short: 80, medium: 100, long: 120, extraLong: 180, phone: 250 },
      housingAllowance: 1000,
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

// 制度修订升级：库里存的是旧版方案时，制度规定的标准（工资档、系数、津贴标准等）
// 以新制度为准重建，仅保留学校自行维护的补充项；同版本则按常规深合并，尊重学校的配置调整。
const POLICY_OWNED_KEYS = [
  "baseSalaryByQualification",
  "degreeAllowance",
  "seniorityRules",
  "seniorityAllowance",
  "housingAllowance",
  "assessmentSalary",
  "probationRule",
  "stageLessonRules",
  "postAllowances",
  "lifeTeacher",
];

export function upgradeSchemeToCurrentPolicy(defaultScheme, storedScheme = {}) {
  const storedVersion = storedScheme?.version;
  const isLegacy = storedVersion && storedVersion !== SCHEME_VERSION && LEGACY_SCHEME_VERSIONS.has(storedVersion);
  if (!isLegacy) return deepMerge(defaultScheme, storedScheme);
  // 旧版：制度参数整体以新标准覆盖，非制度类设置（如结算模式、周数）仍沿用原值
  const preserved = { ...storedScheme };
  POLICY_OWNED_KEYS.forEach((key) => delete preserved[key]);
  const upgraded = deepMerge(defaultScheme, preserved);
  upgraded.version = SCHEME_VERSION;
  return upgraded;
}

export function normalizePayrollRules(rules = {}) {
  const defaults = createDefaultPayrollRules();
  const merged = {
    ...defaults,
    ...(rules || {}),
  };
  merged.teacherSalaryScheme = upgradeSchemeToCurrentPolicy(
    defaults.teacherSalaryScheme,
    rules?.teacherSalaryScheme || {},
  );
  // 兼容刚上线过的按年度配置：切换为单一标准时，优先沿用 2026 年的值；
  // 如果库里没有 2026 年，再取最早一条有效值。归一化后会移除旧字段。
  const storedScheme = rules?.teacherSalaryScheme || {};
  const legacyByYear = storedScheme.minimumWageByYear || merged.teacherSalaryScheme.minimumWageByYear || {};
  const legacyValues = Object.entries(legacyByYear)
    .filter(([year, amount]) => /^\d{4}$/.test(String(year)) && Number(amount) > 0)
    .sort(([left], [right]) => Number(left) - Number(right));
  const configuredMinimumWage = Number(storedScheme.minimumWage);
  const legacyMinimumWage = Number(legacyByYear["2026"] ?? legacyValues[0]?.[1]);
  const probationMinimumWage = Number(merged.teacherSalaryScheme.probationRule?.minimumWage);
  const minimumWage = [configuredMinimumWage, legacyMinimumWage, probationMinimumWage, defaults.teacherSalaryScheme.minimumWage]
    .find((value) => Number.isFinite(value) && value > 0);
  merged.teacherSalaryScheme.minimumWage = roundMoney(minimumWage);
  delete merged.teacherSalaryScheme.minimumWageByYear;
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
  pruneDeprecatedSchemeKeys(merged.teacherSalaryScheme, defaults.teacherSalaryScheme);
  return merged;
}

// 废弃配置清理。deepMerge 只会补齐、不会删除，库里早先写入的键会一直留着：
//   seniorityAllowance —— 1-6 年阶梯表，计算侧从不读它，留着只会让人误以为改它有效
//   seniorityRules 里制度未设的岗位类别（如食堂）—— 留着就有按此发钱的风险
// 校龄类别由制度规定，学校不自定义，因此以默认方案为准裁剪是安全的。
function pruneDeprecatedSchemeKeys(scheme, defaultScheme) {
  if (!scheme || typeof scheme !== "object") return;
  delete scheme.seniorityAllowance;
  if (scheme.seniorityRules && typeof scheme.seniorityRules === "object") {
    const allowed = new Set(Object.keys(defaultScheme.seniorityRules || {}));
    Object.keys(scheme.seniorityRules).forEach((category) => {
      if (!allowed.has(category)) delete scheme.seniorityRules[category];
    });
  }
}

function numberFromTeacherId(teacher = {}) {
  const matched = String(teacher.id || "").match(/(\d+)/);
  return matched ? Number.parseInt(matched[1], 10) : 1;
}

// 存量数据兼容：旧档位键把职称与学历混在一起，统一映射到纯职称键
const LEGACY_QUALIFICATION_ALIASES = {
  firstOrDoctor: "first",
  secondOrMaster: "second",
  thirdOrBachelor: "third",
  ungradedOrJuniorCollege: "ungraded",
};

export function normalizeQualificationGrade(grade = "") {
  return LEGACY_QUALIFICATION_ALIASES[grade] || grade || "third";
}

// ---------------------------------------------------------------------------
// 档位中文名：工资单的计算口径要给人看，不能把 third、primaryCoreHigh 这类
// 内部枚举直接印在明细上。命名沿用《深圳市富源学校薪酬制度》的措辞。
// 前端展示统一读这里，避免同一个枚举在前后端各有一套译名。
// ---------------------------------------------------------------------------
export const QUALIFICATION_GRADE_LABELS = {
  seniorProfessor: "正高级教师",
  seniorTeacher: "高级教师",
  first: "一级教师",
  second: "二级教师",
  third: "三级教师",
  ungraded: "未评级",
};

export const ASSESSMENT_BAND_LABELS = {
  kindergarten: "幼儿园专任",
  high: "高中专任",
  middle: "初中专任",
  primaryCoreHigh: "小学高段核心",
  primaryCoreLow: "小学低段核心",
  primarySpecial: "小学艺体信息心理",
};

// 考核档与学段绑定：小学老师不可能是"高中专任"，制度上考核工资标准本就按学段划分。
// 前端下拉按此收敛可选项，后端保存时按此校验，避免把老师配成跨学段的档位。
export const ASSESSMENT_BANDS_BY_STAGE = {
  kindergarten: ["kindergarten"],
  high: ["high"],
  middle: ["middle"],
  primary: ["primaryCoreHigh", "primaryCoreLow", "primarySpecial"],
};

/** 该学段允许的考核档；学段未知时不做限制，交由调用方决定（避免挡住行政后勤等无学段人员）。 */
export function assessmentBandsForStage(stageId) {
  return ASSESSMENT_BANDS_BY_STAGE[String(stageId || "")] || Object.keys(ASSESSMENT_BAND_LABELS);
}

export function isAssessmentBandAllowedForStage(band, stageId) {
  return assessmentBandsForStage(stageId).includes(String(band || ""));
}

export const HOUSING_TIER_LABELS = {
  teacher: "专任教师",
  chief: "首席",
  backboneOrGradeHead: "骨干/年级主任",
  middleManager: "中层干部",
  otherAdmin: "其他行政人员",
};

export const DEGREE_LABELS = {
  "": "本科及以下",
  bachelor: "本科",
  master: "硕士",
  doctor: "博士",
};

// 没有登记译名时原样返回，至少不会显示成 undefined
function labelOf(map, key, fallback = "") {
  const value = String(key ?? "");
  return map[value] || fallback || value;
}

export function qualificationGradeLabel(grade) {
  return labelOf(QUALIFICATION_GRADE_LABELS, normalizeQualificationGrade(grade));
}

export function assessmentBandLabel(band) {
  return labelOf(ASSESSMENT_BAND_LABELS, band);
}

export function housingTierLabel(tier) {
  return labelOf(HOUSING_TIER_LABELS, tier || "teacher");
}

export function degreeLabel(degree) {
  return labelOf(DEGREE_LABELS, degree, "本科及以下");
}

// 只按【职称】判档，学历不参与（博士/硕士走 degreeAllowance）
function qualificationFromTitle(title = "", seedIndex = 1) {
  if (title.includes("正高")) return "seniorProfessor";
  if (title.includes("高级")) return "seniorTeacher";
  if (title.includes("一级")) return "first";
  if (title.includes("二级")) return "second";
  if (title.includes("三级")) return "third";
  if (title.includes("未评级")) return "ungraded";
  return seedIndex % 4 === 0 ? "second" : "third";
}

// 学历：优先取档案 degree 字段；存量数据未维护时从职称文本兜底推断
export function degreeFromTeacher(teacher = {}) {
  const explicit = String(teacher.degree || teacher.salaryProfile?.degree || "").toLowerCase();
  if (["doctor", "phd", "博士"].some((key) => explicit.includes(key))) return "doctor";
  if (["master", "硕士"].some((key) => explicit.includes(key))) return "master";
  if (explicit) return "";
  const title = String(teacher.title || "");
  if (title.includes("博士")) return "doctor";
  if (title.includes("硕士")) return "master";
  return "";
}

/**
 * 由入职日期推算校龄。制度：「校龄时间计算都为实数，即进校满一年才能计算为一年校龄」。
 *
 * 因此必须比到月日而不是只比年份——2020-09-01 入职的人，在 2026-08 时只满 5 年，
 * 到 9 月才满 6 年。只做年份相减会整整多算一年，直接多发钱。
 *
 * asOf 默认取当天：校龄随时间自然增长，不能写死某一年。
 * 计算月度工资时应传入该月份，避免月初月末算出不同结果。
 */
function schoolYearsFromHiredAt(hiredAt = "", fallback = 1, asOf = new Date()) {
  const text = String(hiredAt || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match) return fallback;
  const hiredYear = Number(match[1]);
  const hiredMonth = Number(match[2]);
  const hiredDay = Number(match[3] || 1);

  const ref = asOf instanceof Date ? asOf : new Date(asOf);
  if (Number.isNaN(ref.getTime())) return fallback;
  const refYear = ref.getFullYear();
  const refMonth = ref.getMonth() + 1;
  const refDay = ref.getDate();

  let years = refYear - hiredYear;
  // 今年的入职纪念日还没到，说明差一点才满整年
  if (refMonth < hiredMonth || (refMonth === hiredMonth && refDay < hiredDay)) years -= 1;
  // 不满一年记 0：制度规定满一年才算一年，未满不计校龄津贴
  return Math.max(0, years);
}

// 结算月的月末作为校龄参照点：同一个月内算出的校龄必须一致，
// 否则月初生成工资单和月末重算会得出不同金额。
function referenceDateForMonth(month = "") {
  const match = String(month || "").match(/^(\d{4})-(\d{2})/);
  if (!match) return new Date();
  const year = Number(match[1]);
  const monthIndex = Number(match[2]);
  return new Date(year, monthIndex, 0); // 第 0 天 = 上个月最后一天 = 本月月末
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
    // 学历与职称独立：博士/硕士按学历补贴发放，不影响职称档
    degree: degreeFromTeacher(teacher),
    schoolYears: schoolYearsFromHiredAt(teacher.hiredAt, (index % 6) + 1),
    assessmentBand: defaultAssessmentBand(teacher),
    // 制度规定专任教师住房补贴统一 2100，不再按骨干/年级长分档
    housingTier: "teacher",
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

// 生活老师不承担课表中的学科课，但仍进入同一套人员、工资确认和薪资台账链路。
// 这里的 roles 是人事事实，由人员档案维护；人数与班主任人数同样由人事确认后带入工资。
export function defaultLifeTeacherSalaryProfile(teacher = {}, seedIndex = null) {
  const index = seedIndex || numberFromTeacherId(teacher);
  const stageId = String(teacher.stageId || "");
  const kind = stageId === "primary" ? "lower" : "standard";
  return {
    version: SCHEME_VERSION,
    salaryCategory: "lifeTeacher",
    seniorityCategory: "lifeTeacher",
    schoolYears: schoolYearsFromHiredAt(teacher.hiredAt, (index % 6) + 1),
    probationRate: 1,
    roles: {
      lifeTeacherKind: kind,
      lifeTeacherStudentCount: 0,
      lifeManager: false,
      buildingLead: false,
      nightShiftLead: false,
      primaryDayShift: false,
      // 接送次数是当月工作量，由财务在工资档案的补充项中据实录入；此处只保留
      // 人事侧的长期任命事实，避免把月度数据写进档案。
    },
    manualItems: [],
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

const PAYROLL_STAGE_LABELS = { kindergarten: "幼儿园", primary: "小学", middle: "初中", high: "高中" };

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
      // 三元表达式只分了两档，高中会落到 else 显示成「小学正课」——
      // 金额是对的，但高中老师打开工资条看到"小学正课"，财务对账也会困惑
      ruleName: `${PAYROLL_STAGE_LABELS[stageId] || ""}正课`,
      basis: `${PAYROLL_STAGE_LABELS[stageId] || ""}正课：${baseRate} 元 × 学科系数 ${coefficient}`,
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
  // 试用期折算已移到汇总层统一处理（按制度"转正后工资的 80%"，范围可配置），此处只出标准额
  const grade = normalizeQualificationGrade(profile.qualificationGrade);
  const amount = Number(scheme.baseSalaryByQualification?.[grade] || 0);
  return {
    name: "基本工资",
    basis: `职称档：${qualificationGradeLabel(grade)}`,
    amount: roundMoney(amount),
    category: "fixed",
  };
}

// 学历补贴（硕士/博士），与职称档并行发放，互不影响
function degreeAllowanceComponent(profile, scheme) {
  const degree = profile.degree || "";
  const amount = Number(scheme.degreeAllowance?.[degree] || 0);
  if (!amount) return null;
  return {
    name: "学历补贴",
    basis: degree === "doctor" ? "博士学历补贴" : "硕士学历补贴",
    amount: roundMoney(amount),
    category: "fixed",
  };
}

// 考核工资 = 岗位标准额 × 月度考核分数 ÷ 100。
// 未录入分数时按 100 分（全额）预览；保存考核时必须由核算员明确输入分数。
function assessmentComponent(teacher, profile, scheme, monthlyAssessment = null) {
  const band = profile.assessmentBand || defaultAssessmentBand(teacher);
  const standard = Number(scheme.assessmentSalary?.[band] || 0);
  const rawScore = monthlyAssessment?.score;
  const score = Number.isFinite(Number(rawScore)) && Number(rawScore) >= 0 ? Number(rawScore) : 100;
  const rate = score / 100;
  const amount = standard * rate;
  const basis = `考核工资基准 ${assessmentBandLabel(band)}（标准 ${standard} 元）× 考核分数 ${score} 分（${score}%）`;
  return {
    name: "考核工资",
    basis,
    amount: roundMoney(amount),
    category: "fixed",
  };
}

// 校龄/工龄津贴：按岗位类别取公式（0726 制度四套并存）
// 制度口径：校龄取实数（进校满一年才计一年），故对年数向下取整
export function seniorityAllowanceFor(years, rule = {}) {
  const y = Math.max(0, Math.floor(Number(years) || 0));
  if (!y) return { amount: 0, basis: "校龄不足 1 年" };
  const cap = Number(rule.cap || 0);
  let amount;
  let basis;
  if (rule.mode === "flat") {
    const rate = Number(rule.flatRate || 0);
    amount = y * rate;
    basis = `校龄 ${y} 年 × ${rate} 元`;
  } else {
    const tier1Years = Number(rule.tier1Years ?? 3);
    const tier1Rate = Number(rule.tier1Rate ?? 100);
    const tier2Base = Number(rule.tier2Base ?? 300);
    const tier2Rate = Number(rule.tier2Rate ?? 50);
    if (y <= tier1Years) {
      amount = y * tier1Rate;
      basis = `校龄 ${y} 年（${tier1Years} 年内）× ${tier1Rate} 元`;
    } else {
      amount = tier2Base + (y - tier1Years) * tier2Rate;
      basis = `校龄 ${y} 年：${tier2Base} + (${y}-${tier1Years}) × ${tier2Rate} 元`;
    }
  }
  if (cap && amount > cap) {
    return { amount: cap, basis: `${basis}，封顶 ${cap} 元` };
  }
  return { amount: roundMoney(amount), basis };
}

function seniorityComponent(profile, scheme) {
  const category = profile.seniorityCategory || "teacher";
  const rule = scheme.seniorityRules?.[category];
  // 没有配置规则的岗位类别不发校龄津贴——制度只给专任教师、校医、生活教师、
  // 司机设了这一项，后勤职工没有。此处绝不能回退到教师规则：那会给不该拿的人
  // 按 100 元/年发钱，且金额越算越多不易察觉。
  if (!rule) {
    return { name: "校龄工资", basis: "该岗位类别未设校龄津贴", amount: 0, category: "fixed" };
  }
  const { amount, basis } = seniorityAllowanceFor(profile.schoolYears, rule);
  return {
    name: "校龄工资",
    basis,
    amount,
    category: "fixed",
  };
}

function housingComponent(profile, scheme) {
  const tier = profile.housingTier || "teacher";
  return {
    name: "住房补贴",
    basis: `住房补贴档：${housingTierLabel(tier)}`,
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

  // 年级长：初高中按"班数 × 单价 + 固定额"动态计算，小学为固定标准
  if (roles.gradeHead) {
    const perClass = Number(cfg.gradeHeadPerClass || 0);
    if (perClass) {
      const classCount = Number(roles.gradeClassCount || 0);
      const base = Number(cfg.gradeHeadBase || 0);
      push(true, "年级主任津贴", classCount * perClass + base, `${classCount} 个班 × ${perClass} 元 + 固定 ${base} 元`);
    } else {
      push(true, "年级主任津贴", cfg.gradeHead, "按学段岗位津贴标准");
    }
  }
  push(roles.deputyGradeHead, "年级副主任津贴", cfg.deputyGradeHead, "按学段岗位津贴标准");
  push(roles.teachingResearchLeader, "教研组长津贴", cfg.teachingResearchLeader, "按学段岗位津贴标准");
  push(roles.teachingResearchDeputy, "教研副组长津贴", cfg.teachingResearchDeputy, "按学段岗位津贴标准");
  // 备课组长：统考年级 > 大组(语数外) > 常规档
  push(
    roles.lessonPrepLeader,
    "备课组长津贴",
    roles.lessonPrepStandardizedGrade && cfg.lessonPrepStandardizedGrade
      ? cfg.lessonPrepStandardizedGrade
      : cfg.lessonPrepLargeGroup && roles.lessonPrepLargeGroup
        ? cfg.lessonPrepLargeGroup
        : cfg.lessonPrepLeader || cfg.lessonPrepHigh || cfg.lessonPrepLow,
    "按学段备课组岗位津贴标准",
  );
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

// 试用期工资政策（0726 制度第六条）：按转正后工资的 80% 计发，且不低于深圳市最低工资标准。
//   scope="all"（默认，按制度字面"工资"理解）折算全部薪酬项；scope="fixed" 只折算固定项与津贴。
//   折算后若低于最低工资标准，补足差额并在明细中列示，保证不违法。
export function applyProbationPolicy(components, profile = {}, scheme = {}) {
  const rate = Number(profile.probationRate ?? 1);
  if (!(rate >= 0) || rate >= 1) return components;
  const rule = scheme.probationRule || {};
  const scope = rule.scope || "all";
  const percent = Math.round(rate * 100);
  const adjusted = components.map((component) => {
    if (scope === "fixed" && !["fixed", "allowance"].includes(component.category)) return component;
    return {
      ...component,
      amount: roundMoney(component.amount * rate),
      basis: `${component.basis}；试用期按 ${percent}% 计发`,
    };
  });
  const minimumWage = minimumWageForScheme(scheme);
  if (!minimumWage) return adjusted;
  const total = adjusted.reduce((sum, item) => sum + item.amount, 0);
  if (total >= minimumWage) return adjusted;
  return [
    ...adjusted,
    {
      name: "最低工资补足",
      basis: `试用期工资 ${roundMoney(total)} 元低于当地最低工资标准 ${minimumWage} 元，按规定补足`,
      amount: roundMoney(minimumWage - total),
      category: "supplement",
    },
  ];
}

// 单一最低工资标准。probationRule.minimumWage 与 minimumWageByYear 只用于旧账套兼容，
// 保存后会由 normalizePayrollRules 收敛为 scheme.minimumWage。
export function minimumWageForScheme(scheme = {}) {
  const configured = Number(scheme.minimumWage);
  if (Number.isFinite(configured) && configured > 0) return roundMoney(configured);
  const legacyByYear = scheme.minimumWageByYear || {};
  const legacy = Object.entries(legacyByYear)
    .filter(([year, amount]) => /^\d{4}$/.test(String(year)) && Number(amount) > 0)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([, amount]) => Number(amount))[0];
  if (Number.isFinite(legacy) && legacy > 0) return roundMoney(legacy);
  const fallback = Number(scheme.probationRule?.minimumWage || 0);
  return Number.isFinite(fallback) && fallback > 0 ? roundMoney(fallback) : 0;
}

// 兼岗津贴发放政策（0726 制度第三条原则 1 与原则 6，经学校澄清）：
//   授课教师——兼多个教学岗位，津贴可叠加（默认）
//   行政管理人员——兼任多职务时择最高一项发放，且兼岗不超过 1 项
export function applyPostAllowancePolicy(components, profile = {}) {
  const mode = profile.postAllowanceMode || "stack";
  if (mode !== "highest" || components.length <= 1) return components;
  const limit = Math.max(1, Number(profile.maxPostAllowanceCount || 1));
  const sorted = [...components].sort((a, b) => b.amount - a.amount);
  const kept = sorted.slice(0, limit);
  const dropped = sorted.slice(limit);
  if (!dropped.length) return kept;
  const droppedNames = dropped.map((item) => item.name).join("、");
  return kept.map((item, index) =>
    index === 0
      ? { ...item, basis: `${item.basis}；行政岗位择高发放，未计：${droppedNames}` }
      : item,
  );
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

function attendanceDeductionComponent(attendanceSettlement = null, { assessmentSalary = 0, grossBeforeAttendance = 0 } = {}) {
  const fixedDeduction = Number(attendanceSettlement?.totalDeduction || 0);
  const performanceDeductionRate = Math.max(0, Math.min(1, Number(attendanceSettlement?.performanceDeductionRate || 0)));
  const performanceDeduction = roundMoney(Math.max(0, Number(assessmentSalary || 0)) * performanceDeductionRate);
  const absenceDailyFraction = Math.max(0, Number(attendanceSettlement?.absenceDailyFraction || 0));
  const dynamicAbsenceDeduction = roundMoney(
    Math.max(0, Number(grossBeforeAttendance || 0)) * absenceDailyFraction * Math.max(0, Number(attendanceSettlement?.absenceDays || 0)),
  );
  const totalDeduction = roundMoney(fixedDeduction + performanceDeduction + dynamicAbsenceDeduction);
  if (!attendanceSettlement?.applies || !Number.isFinite(totalDeduction) || totalDeduction <= 0) return null;
  const parts = [];
  if (Number(attendanceSettlement.lateEarlyCount || 0) > 0 && performanceDeductionRate > 0 && attendanceSettlement.requiresPayrollContext) {
    parts.push(`${attendanceSettlement.attendanceLabel || "迟到／早退"} ${attendanceSettlement.lateEarlyCount} 次`);
  } else if (Number(attendanceSettlement.lateEarlyCount || 0) > 0) {
    parts.push(`${attendanceSettlement.attendanceLabel || "迟到／早退"} ${attendanceSettlement.lateEarlyCount} 次，扣 ${roundMoney(attendanceSettlement.lateEarlyDeduction || 0)} 元`);
  }
  if (Number(attendanceSettlement.missingPunchCount || 0) > 0) {
    parts.push(`未补卡 ${attendanceSettlement.missingPunchCount} 次，扣 ${roundMoney(attendanceSettlement.missingPunchDeduction || 0)} 元`);
  }
  if (Number(attendanceSettlement.absenceDays || 0) > 0) {
    if (absenceDailyFraction > 0) {
      parts.push(`旷工 ${attendanceSettlement.absenceDays} 天 × 当月工资总额 1/22，扣 ${dynamicAbsenceDeduction} 元`);
    } else {
      parts.push(`无故旷工 ${attendanceSettlement.absenceDays} 天 × ${roundMoney(attendanceSettlement.absenceRate || 300)} 元，扣 ${roundMoney(attendanceSettlement.absenceDeduction || 0)} 元`);
    }
  }
  if (Number(attendanceSettlement.seriousOccurrenceCount || 0) > 0) {
    parts.push(`超时迟到／早退 ${attendanceSettlement.seriousOccurrenceCount} 次`);
  }
  if (Number(attendanceSettlement.missedClassCount || 0) > 0) {
    parts.push(`旷课 ${attendanceSettlement.missedClassCount} 节（对应课次须标为已取消，不计课时工资）`);
  }
  if (performanceDeductionRate > 0) {
    parts.push(`考核工资 ${roundMoney(assessmentSalary)} 元 × 考勤违纪扣除 ${Math.round(performanceDeductionRate * 100)}%，扣 ${performanceDeduction} 元`);
  }
  return {
    name: attendanceSettlement.componentName || "考勤扣款",
    basis: `${attendanceSettlement.policyName || "考勤制度"}：${parts.join("；")}`,
    amount: -roundMoney(totalDeduction),
    category: "deduction",
  };
}

const LIFE_TEACHER_KIND_LABELS = {
  lower: "低段生活老师",
  upper: "高段生活老师",
  standard: "生活老师",
  night: "门岗／夜班生活老师",
};

function isLifeTeacherPayroll(teacher = {}, hrFacts = null) {
  return String(hrFacts?.positionId || "") === "POS-LIFE-TEACHER" || String(teacher.salaryProfile?.salaryCategory || "") === "lifeTeacher";
}

function lifeTeacherAssessmentComponent(teacher, profile, scheme, monthlyAssessment = null) {
  const stageId = String(teacher.stageId || "");
  const kind = String(profile.roles?.lifeTeacherKind || (stageId === "primary" ? "lower" : "standard"));
  const standard = Number(scheme.lifeTeacher?.assessmentByStage?.[stageId]?.[kind] || 0);
  const score = Number.isFinite(Number(monthlyAssessment?.score)) && Number(monthlyAssessment.score) >= 0
    ? Number(monthlyAssessment.score)
    : 100;
  return {
    name: "考核工资",
    basis: `${LIFE_TEACHER_KIND_LABELS[kind] || "生活老师"}基准 ${standard} 元 × 考核分数 ${score} 分（${score}%）`,
    amount: roundMoney(standard * score / 100),
    category: "fixed",
  };
}

function lifeTeacherComponents(teacher, profile, scheme, monthlyAssessment = null) {
  const stageId = String(teacher.stageId || "");
  const lifeScheme = scheme.lifeTeacher || {};
  const workloadRule = lifeScheme.workloadByStage?.[stageId] || {};
  const roles = profile.roles || {};
  const students = Math.max(0, Number(roles.lifeTeacherStudentCount || 0));
  const perStudent = Math.max(0, Number(workloadRule.perStudent || 0));
  const cap = Math.max(0, Number(workloadRule.cap || 0));
  const rawWorkload = students * perStudent;
  const workload = cap ? Math.min(rawWorkload, cap) : rawWorkload;
  const components = [
    { name: "基本工资", basis: `生活老师基本工资标准 ${Number(lifeScheme.baseSalary || 0)} 元／月`, amount: roundMoney(lifeScheme.baseSalary || 0), category: "fixed" },
    { name: "工作量工资", basis: `${students} 人 × ${perStudent} 元${cap ? `，封顶 ${cap} 元` : ""}`, amount: roundMoney(workload), category: "allowance" },
    lifeTeacherAssessmentComponent(teacher, profile, scheme, monthlyAssessment),
    seniorityComponent(profile, scheme),
    { name: "住房补贴", basis: `生活老师住房补贴标准 ${Number(lifeScheme.housingAllowance || 0)} 元／月`, amount: roundMoney(lifeScheme.housingAllowance || 0), category: "allowance" },
  ];
  const phoneAllowance = Number(lifeScheme.transportAllowance?.phone || 0);
  if (phoneAllowance) components.push({ name: "话费补助", basis: "生活老师接送通讯补助", amount: roundMoney(phoneAllowance), category: "allowance" });
  const postConfig = lifeScheme.postAllowancesByStage?.[stageId] || {};
  [
    ["lifeManager", "生活主管津贴"],
    ["buildingLead", "栋长津贴"],
    ["nightShiftLead", "夜班组长津贴"],
    ["primaryDayShift", "一年级／六年级白班津贴"],
  ].forEach(([key, name]) => {
    const amount = Number(postConfig[key] || 0);
    if (roles[key] && amount) components.push({ name, basis: `按${PAYROLL_STAGE_LABELS[stageId] || "学部"}生活老师兼岗标准`, amount: roundMoney(amount), category: "allowance" });
  });
  return [...components, ...manualComponents(profile)].filter((component) => component && component.amount);
}

function lifeTeacherTransportComponent(monthlyAssessment, scheme) {
  const counts = monthlyAssessment?.lifeTeacherTransport || {};
  const rates = scheme.lifeTeacher?.transportAllowance || {};
  const lines = [
    ["short", "短途"], ["medium", "中途"], ["long", "长途"], ["extraLong", "超长途"],
  ]
    .map(([key, label]) => ({ key, label, count: Math.max(0, Number(counts[key] || 0)), rate: Math.max(0, Number(rates[key] || 0)) }))
    .filter((item) => item.count > 0 && item.rate > 0);
  if (!lines.length) return null;
  return {
    name: "接送补助",
    basis: lines.map((item) => `${item.label} ${item.count} 次 × ${item.rate} 元`).join("；"),
    amount: roundMoney(lines.reduce((sum, item) => sum + item.count * item.rate, 0)),
    category: "supplement",
  };
}

function calculateLifeTeacherPayroll({ teacher, month, payrollRules, fixedProrationFactor = 1, prorationNote = "", monthlyAssessment = null, hrFacts = null, calendarSettlement = null, leaveSettlement = null, attendanceSettlement = null } = {}) {
  const normalizedRules = normalizePayrollRules(payrollRules);
  const scheme = normalizedRules.teacherSalaryScheme;
  const defaults = defaultLifeTeacherSalaryProfile(teacher);
  const profile = {
    ...defaults,
    ...(teacher.salaryProfile || {}),
    salaryCategory: "lifeTeacher",
    seniorityCategory: "lifeTeacher",
    roles: { ...defaults.roles, ...(teacher.salaryProfile?.roles || {}), ...(hrFacts?.roles || {}) },
  };
  if (hrFacts?.hiredAt) profile.schoolYears = schoolYearsFromHiredAt(hrFacts.hiredAt, profile.schoolYears, referenceDateForMonth(month));
  if (hrFacts?.status) profile.probationRate = hrFacts.status === "probation" ? 0.8 : 1;
  const employmentType = hrFacts?.employmentType === "agreement" ? "agreement" : "normal";
  const workStatus = hrFacts?.workStatus === "standby" ? "standby" : "employed";
  const agreementMonthlySalary = Number(hrFacts?.agreementMonthlySalary || 0);
  if (employmentType === "agreement" && agreementMonthlySalary <= 0) throw new Error("协议生活老师缺少有效的协议月薪，请由总校人事 + 行政在人事档案中维护");

  const totalCalendarDays = Math.max(0, Number(calendarSettlement?.totalDays || 0));
  const holidayDays = Math.min(totalCalendarDays, Math.max(0, Number(calendarSettlement?.holidayDays || 0)));
  const teachingDays = Math.max(0, totalCalendarDays - holidayDays);
  const hasHolidaySettlement = totalCalendarDays > 0 && holidayDays > 0;
  const managementLevel = String(hrFacts?.managementLevel || "ordinary");
  const holidayRate = managementLevel === "ordinary" ? 0.8 : 1;
  const teachingFactor = hasHolidaySettlement ? teachingDays / totalCalendarDays : 1;
  const holidayFactor = hasHolidaySettlement ? holidayDays / totalCalendarDays : 0;
  const holidayNames = (calendarSettlement?.holidayEntries || []).map((item) => item.name).filter(Boolean).join("、") || "假期";
  const prorate = Math.min(Math.max(Number(fixedProrationFactor) || 1, 0), 1);
  const fullAssessmentAmount = lifeTeacherAssessmentComponent(teacher, profile, scheme, null).amount;
  const fixedComponents = lifeTeacherComponents(teacher, profile, scheme, monthlyAssessment)
    .map((component) => {
      let adjusted = component;
      if (hasHolidaySettlement && ["fixed", "allowance"].includes(component.category)) {
        if (component.name === "考核工资") {
          const amount = managementLevel === "ordinary" ? component.amount * teachingFactor : component.amount * teachingFactor + fullAssessmentAmount * holidayFactor;
          adjusted = { ...component, amount: roundMoney(amount), basis: managementLevel === "ordinary" ? `${component.basis}；${holidayNames} ${holidayDays}/${totalCalendarDays} 天不核算考核工资` : `${component.basis}；${holidayNames} ${holidayDays}/${totalCalendarDays} 天按 100% 假期工资计` };
        } else {
          adjusted = { ...component, amount: roundMoney(component.amount * (teachingFactor + holidayFactor * holidayRate)), basis: `${component.basis}；${holidayNames} ${holidayDays}/${totalCalendarDays} 天按 ${Math.round(holidayRate * 100)}% 假期工资计` };
        }
      }
      if (prorate >= 1 || !["fixed", "allowance"].includes(adjusted.category)) return adjusted;
      return { ...adjusted, amount: roundMoney(adjusted.amount * prorate), basis: `${adjusted.basis}；${prorationNote || `按在职天数折算 ${Math.round(prorate * 100)}%`}` };
    })
    .filter((component) => component && component.amount);
  const normalComponents = applyProbationPolicy([...applyLeaveSettlementPolicy(fixedComponents, leaveSettlement), lifeTeacherTransportComponent(monthlyAssessment, scheme)].filter(Boolean), profile, scheme);
  const agreementPeriodFactor = totalCalendarDays > 0 ? teachingFactor + holidayFactor * 0.8 : 1;
  const agreementAmount = roundMoney(agreementMonthlySalary * agreementPeriodFactor * prorate);
  const agreementBasis = hasHolidaySettlement
    ? `协议月薪 ${agreementMonthlySalary} 元；正式学期 ${teachingDays}/${totalCalendarDays} 天按 100%，${holidayNames} ${holidayDays}/${totalCalendarDays} 天按 80%`
    : `协议月薪 ${agreementMonthlySalary} 元；正式学期按 100% 结算`;
  const standbyHousing = Number(scheme.lifeTeacher?.housingAllowance || 0);
  const standbyComponents = [
    { name: "待岗工资", basis: `最低工资标准 ${minimumWageForScheme(scheme)} 元 × 80%`, amount: roundMoney(minimumWageForScheme(scheme) * 0.8), category: "fixed" },
    ...(standbyHousing ? [{ name: "住房补贴", basis: "生活老师住房补贴；待岗人员全额保留", amount: roundMoney(standbyHousing), category: "allowance" }] : []),
  ];
  const payrollComponents = workStatus === "standby" ? standbyComponents : employmentType === "agreement" ? [{ name: "协议工资", basis: agreementBasis, amount: agreementAmount, category: "fixed" }] : normalComponents;
  const attendanceDeduction = attendanceDeductionComponent(attendanceSettlement, {
    assessmentSalary: payrollComponents.find((component) => component.name === "考核工资")?.amount || 0,
    grossBeforeAttendance: payrollComponents.reduce((sum, component) => sum + Number(component.amount || 0), 0),
  });
  const components = [...payrollComponents, attendanceDeduction].filter(Boolean);
  const grossPay = roundMoney(components.reduce((sum, component) => sum + component.amount, 0));
  const tax = roundMoney(Math.max(grossPay - Number(normalizedRules.taxThreshold || 0), 0) * Number(normalizedRules.taxRate || 0));
  const amountOf = (name) => roundMoney(components.find((item) => item.name === name)?.amount || 0);
  return {
    teacher, month, salarySchemeVersion: scheme.version, salaryProfile: profile,
    baseSalary: amountOf("基本工资"), assessmentSalary: amountOf("考核工资"), senioritySalary: amountOf("校龄工资"), housingAllowance: amountOf("住房补贴"),
    positionSalary: roundMoney(components.filter((item) => item.category === "allowance" && item.name !== "住房补贴").reduce((sum, item) => sum + item.amount, 0)),
    supplementalAmount: roundMoney(components.filter((item) => item.category === "supplement").reduce((sum, item) => sum + item.amount, 0)),
    deductionAmount: roundMoney(Math.abs(components.filter((item) => item.category === "deduction").reduce((sum, item) => sum + item.amount, 0))),
    lessonAmount: 0, employmentType, workStatus, agreementMonthlySalary: employmentType === "agreement" ? agreementMonthlySalary : 0,
    grossPay, tax, netPay: roundMoney(grossPay - tax), components, lines: [],
    calendarSettlement: { tag: hasHolidaySettlement ? "holiday" : "teaching", totalDays: totalCalendarDays, teachingDays, holidayDays, holidayRate: hasHolidaySettlement ? (employmentType === "agreement" ? 0.8 : holidayRate) : 1, managementLevel, employmentType, holidayEntries: calendarSettlement?.holidayEntries || [] },
    leaveSettlement: leaveSettlement ? { ...leaveSettlement, applied: employmentType === "normal" && Number(leaveSettlement.policyLeaveDays || 0) > 0 } : null,
    attendanceSettlement: attendanceSettlement ? { ...attendanceSettlement, applied: Boolean(attendanceSettlement.applies) } : null,
  };
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
  // 月度考核结果：{ score: number, note?: string }；分数直接对应百分比系数。
  monthlyAssessment = null,
  // 人事档案事实：职称、学历、兼岗任命、入职日期。这些是人事维护的客观事实，
  // 薪资引擎只读取用于套标准，财务不可改（职责分离）。缺省时回落到工资档案，保证兼容。
  hrFacts = null,
  // 校历结算事实：正式学期按原有课时/考核口径；假期按人员层级结算。
  // 由 storage 根据教师所属学部的校历逐日统计后传入。
  calendarSettlement = null,
  // 已最终审批的请假，按该自然月内实际占用的上午／下午折算。
  // 这里只接收已去重的结算事实，避免工资引擎再去依赖 OA 数据结构。
  leaveSettlement = null,
  // 已导入且仍为当前版本的月度考勤结算事实。目前仅初中部有已确认的自动扣款规则。
  attendanceSettlement = null,
} = {}) {
  const normalizedRules = normalizePayrollRules(payrollRules);
  const scheme = normalizedRules.teacherSalaryScheme;
  if (isLifeTeacherPayroll(teacher, hrFacts)) {
    return calculateLifeTeacherPayroll({
      teacher,
      month,
      payrollRules,
      fixedProrationFactor,
      prorationNote,
      monthlyAssessment,
      hrFacts,
      calendarSettlement,
      leaveSettlement,
      attendanceSettlement,
    });
  }
  const defaults = defaultTeacherSalaryProfile(teacher);
  const profile = {
    ...defaults,
    ...(teacher.salaryProfile || {}),
    roles: {
      ...defaults.roles,
      ...(teacher.salaryProfile?.roles || {}),
    },
  };
  // 人事档案的事实覆盖工资档案：职称/学历/兼岗任命以人事为准
  if (hrFacts) {
    if (hrFacts.titleGrade) profile.qualificationGrade = hrFacts.titleGrade;
    if (hrFacts.degree !== undefined && hrFacts.degree !== null) profile.degree = hrFacts.degree;
    if (hrFacts.roles) profile.roles = { ...profile.roles, ...hrFacts.roles };
    // 校龄按入职日期推算，不再手工维护，避免与人事档案不一致。
    // 参照点取结算月月末，保证同一个月无论哪天生成工资单，算出的校龄都一样。
    if (hrFacts.hiredAt) {
      profile.schoolYears = schoolYearsFromHiredAt(
        hrFacts.hiredAt,
        profile.schoolYears,
        referenceDateForMonth(month),
      );
    }
    // 试用期折算由人事状态推导：试用期 80%，其余全额
    if (hrFacts.status) profile.probationRate = hrFacts.status === "probation" ? 0.8 : 1;
  }
  const employmentType = hrFacts?.employmentType === "agreement" ? "agreement" : "normal";
  // “就业／待岗”是岗位安排状态，和“正常／协议”雇佣类型独立：
  // 人员进入待岗后，以待岗公式替代其原有工资方案。
  const workStatus = hrFacts?.workStatus === "standby" ? "standby" : "employed";
  const agreementMonthlySalary = Number(hrFacts?.agreementMonthlySalary || 0);
  if (employmentType === "agreement" && (!Number.isFinite(agreementMonthlySalary) || agreementMonthlySalary <= 0)) {
    throw new Error("协议教师缺少有效的协议月薪，请由总校人事 + 行政在人事档案中维护");
  }
  const sortedLessons = [...lessons].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const highRegularWeekUnits = new Map();
  const lines = sortedLessons.map((lesson) => {
    // 计薪口径：排给谁就算谁的，除非这节课被取消。
    //
    // 原来按「已签到完成」计薪，依赖教师逐节扫码签入签出——漏签一节就少一节的钱，
    // 而漏签的原因往往和上没上课无关（手机没电、二维码被挡住）。学校的规则是
    // 派了课就该上，于是签到只是在给一件本该确定的事引入不确定性。
    //
    // 代课、请假与外出不需要在这里额外查审批单：薪资侧读取的是课表投影。
    //   代课  审批通过时课次改为 substitute 类型，代课老师按代课单价计
    //   请假  未安排代课的课次标记 cancelled，谁也不计
    //   外出  原老师还会收到一条正常课时的只读投影，体现“原课时工资照发”
    const payable = lesson.status !== "cancelled";
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
      basis:
        workStatus === "standby"
          ? `${rule.basis}；待岗期间课时不另计薪`
          : employmentType === "agreement"
            ? `${rule.basis}；协议教师课时不另计薪`
            : lesson.outboundOriginalPay
              ? `${rule.basis}；外出期间已安排代课，原任课老师课时工资照发`
              : rule.basis,
      status: lesson.status,
      amount: employmentType === "agreement" || workStatus === "standby" ? 0 : payable ? rule.amount : 0,
      payable: employmentType === "agreement" || workStatus === "standby" ? false : payable,
    };
  });

  const lessonAmount = roundMoney(lines.reduce((sum, line) => sum + line.amount, 0));
  const prorate = Math.min(Math.max(Number(fixedProrationFactor) || 1, 0), 1);
  const rawFixedComponents = [
    baseSalaryComponent(profile, scheme),
    degreeAllowanceComponent(profile, scheme),
    assessmentComponent(teacher, profile, scheme, monthlyAssessment),
    seniorityComponent(profile, scheme),
    housingComponent(profile, scheme),
    ...applyPostAllowancePolicy(roleComponents(teacher, profile, scheme), profile),
    ...manualComponents(profile),
  ].filter((component) => component && component.amount);
  const totalCalendarDays = Math.max(0, Number(calendarSettlement?.totalDays || 0));
  const holidayDays = Math.min(totalCalendarDays, Math.max(0, Number(calendarSettlement?.holidayDays || 0)));
  const teachingDays = Math.max(0, totalCalendarDays - holidayDays);
  const hasHolidaySettlement = totalCalendarDays > 0 && holidayDays > 0;
  const managementLevel = String(hrFacts?.managementLevel || "ordinary");
  const holidayRate = managementLevel === "ordinary" ? 0.8 : 1;
  const teachingFactor = hasHolidaySettlement ? teachingDays / totalCalendarDays : 1;
  const holidayFactor = hasHolidaySettlement ? holidayDays / totalCalendarDays : 0;
  const holidayNames = (calendarSettlement?.holidayEntries || []).map((item) => item.name).filter(Boolean).join("、") || "假期";
  const fullAssessmentAmount = assessmentComponent(teacher, profile, scheme, null).amount;
  const fixedComponents = rawFixedComponents
    .map((component) => {
      let adjusted = component;
      if (hasHolidaySettlement && ["fixed", "allowance"].includes(component.category)) {
        if (component.name === "考核工资") {
          const amount = managementLevel === "ordinary"
            // 普通员工的假期没有考核；仅保留教学日对应的考核工资。
            ? component.amount * teachingFactor
            // 高层/中层的假期按 100% 标准额计，不受本月考核分数影响。
            : component.amount * teachingFactor + fullAssessmentAmount * holidayFactor;
          adjusted = {
            ...component,
            amount: roundMoney(amount),
            basis: managementLevel === "ordinary"
              ? `${component.basis}；${holidayNames} ${holidayDays}/${totalCalendarDays} 天不核算考核工资`
              : `${component.basis}；${holidayNames} ${holidayDays}/${totalCalendarDays} 天按 100% 假期工资计`,
          };
        } else {
          const amount = component.amount * (teachingFactor + holidayFactor * holidayRate);
          adjusted = {
            ...component,
            amount: roundMoney(amount),
            basis: `${component.basis}；${holidayNames} ${holidayDays}/${totalCalendarDays} 天按 ${Math.round(holidayRate * 100)}% 假期工资计`,
          };
        }
      }
      // 只折算固定月度项（fixed/allowance）：课时按实际完成结算、奖扣按实际录入不折算
      if (prorate >= 1 || !["fixed", "allowance"].includes(adjusted.category)) return adjusted;
      return {
        ...adjusted,
        amount: roundMoney(adjusted.amount * prorate),
        basis: `${adjusted.basis}；${prorationNote || `按在职天数折算 ${Math.round(prorate * 100)}%`}`,
      };
    })
    // 假期普通人员的考核工资会被归零；与原有 0 分考核口径保持一致，不在工资单里显示 0 元行。
    .filter((component) => component && component.amount);
  // 请假按天折算，而不是把整个月当作请假月处理：
  //   - 产假、病假：保留基本工资和住房补贴；其他固定项按请假天数扣减；
  //   - 事假：只保留住房补贴；基本工资及其他固定项按请假天数扣减。
  // 课时工资不在这里二次扣减，请假审批已将对应课次安排代课或取消，课表才是课时工资唯一口径。
  const leaveAdjustedFixedComponents = employmentType === "normal"
    ? applyLeaveSettlementPolicy(fixedComponents, leaveSettlement)
    : fixedComponents;
  const lessonComponent = {
    name: "课时工资",
    basis: "按实际完成课次、课型、学段、学科系数和高中超课时规则汇总",
    amount: lessonAmount,
    category: "lesson",
  };
  const standardComponents = applyProbationPolicy([...leaveAdjustedFixedComponents, lessonComponent], profile, scheme);
  // 协议教师不再叠加课时、考核、职称、校龄或兼岗项目，工资单只保留协议价这一项。
  // 学期内按 100%，假期按 80%；跨时段月份按各自覆盖天数折算。
  const agreementPeriodFactor = totalCalendarDays > 0
    ? teachingFactor + holidayFactor * 0.8
    : 1;
  const agreementAmount = employmentType === "agreement"
    ? roundMoney(agreementMonthlySalary * agreementPeriodFactor * prorate)
    : 0;
  const agreementBasis = employmentType === "agreement"
    ? [
        `协议月薪 ${agreementMonthlySalary} 元`,
        hasHolidaySettlement
          ? `正式学期 ${teachingDays}/${totalCalendarDays} 天按 100%，${holidayNames} ${holidayDays}/${totalCalendarDays} 天按 80%`
          : "正式学期按 100% 结算",
        ...(prorate < 1 ? [prorationNote || `按在职天数折算 ${Math.round(prorate * 100)}%`] : []),
      ].join("；")
    : "";
  const minimumWage = minimumWageForScheme(scheme);
  const standbyHousing = housingComponent(profile, scheme);
  const standbyComponents = [
    {
      name: "待岗工资",
      basis: `最低工资标准 ${minimumWage} 元 × 80%`,
      amount: roundMoney(minimumWage * 0.8),
      category: "fixed",
    },
    ...(standbyHousing?.amount
      ? [
          {
            ...standbyHousing,
            basis: `${standbyHousing.basis}；待岗人员住房补贴全额保留`,
          },
        ]
      : []),
  ];
  const payrollComponents = workStatus === "standby"
    ? standbyComponents
    : employmentType === "agreement"
      ? [{ name: "协议工资", basis: agreementBasis, amount: agreementAmount, category: "fixed" }]
      : standardComponents;
  const attendanceDeduction = attendanceDeductionComponent(attendanceSettlement, {
    assessmentSalary: payrollComponents.find((component) => component.name === "考核工资")?.amount || 0,
    grossBeforeAttendance: payrollComponents.reduce((sum, component) => sum + Number(component.amount || 0), 0),
  });
  const components = [...payrollComponents, attendanceDeduction].filter(Boolean);
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
    lessonAmount: employmentType === "agreement" || workStatus === "standby" ? 0 : lessonAmount,
    employmentType,
    workStatus,
    agreementMonthlySalary: employmentType === "agreement" ? agreementMonthlySalary : 0,
    grossPay,
    tax,
    netPay,
    components,
    lines,
    calendarSettlement: {
      tag: hasHolidaySettlement ? "holiday" : "teaching",
      totalDays: totalCalendarDays,
      teachingDays,
      holidayDays,
      holidayRate: hasHolidaySettlement ? (employmentType === "agreement" ? 0.8 : holidayRate) : 1,
      managementLevel,
      employmentType,
      holidayEntries: calendarSettlement?.holidayEntries || [],
    },
    leaveSettlement: leaveSettlement
      ? {
          ...leaveSettlement,
          applied: employmentType === "normal" && Number(leaveSettlement.policyLeaveDays || 0) > 0,
        }
      : null,
    attendanceSettlement: attendanceSettlement
      ? { ...attendanceSettlement, applied: Boolean(attendanceSettlement.applies) }
      : null,
  };
}

function leaveSettlementSummary(leaveSettlement = {}) {
  const parts = [];
  const maternityDays = Number(leaveSettlement.maternityDays || 0);
  const sickDays = Number(leaveSettlement.sickDays || 0);
  const personalDays = Number(leaveSettlement.personalDays || 0);
  if (maternityDays > 0) parts.push(`产假 ${maternityDays} 天（保留基本工资、住房补贴）`);
  if (sickDays > 0) parts.push(`病假 ${sickDays} 天（保留基本工资、住房补贴）`);
  if (personalDays > 0) parts.push(`事假 ${personalDays} 天（仅保留住房补贴）`);
  return parts.join("；");
}

function applyLeaveSettlementPolicy(components = [], leaveSettlement = null) {
  if (!leaveSettlement) return components;
  const daysInMonth = Math.max(1, Number(leaveSettlement.daysInMonth || 0));
  const maternityDays = Math.max(0, Number(leaveSettlement.maternityDays || 0));
  const sickDays = Math.max(0, Number(leaveSettlement.sickDays || 0));
  const personalDays = Math.max(0, Number(leaveSettlement.personalDays || 0));
  const allPolicyDays = Math.min(daysInMonth, maternityDays + sickDays + personalDays);
  if (allPolicyDays <= 0) return components;
  const summary = leaveSettlementSummary({ maternityDays, sickDays, personalDays });
  const regularFactor = Math.max(0, 1 - allPolicyDays / daysInMonth);
  const baseSalaryFactor = Math.max(0, 1 - Math.min(daysInMonth, personalDays) / daysInMonth);

  return components
    .map((component) => {
      if (!component || !["fixed", "allowance"].includes(component.category)) return component;
      if (component.name === "住房补贴") {
        return {
          ...component,
          basis: `${component.basis}；${summary}，住房补贴不扣减`,
        };
      }
      const factor = component.name === "基本工资" ? baseSalaryFactor : regularFactor;
      if (factor >= 1) return component;
      return {
        ...component,
        amount: roundMoney(component.amount * factor),
        basis: `${component.basis}；${summary}，按 ${daysInMonth} 个自然日折算 ${Math.round(factor * 10000) / 100}%`,
      };
    })
    .filter((component) => component && component.amount);
}
