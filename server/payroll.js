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
    // minimumWage 需按深圳市当年公布标准维护，逐年调整时改此处即可
    probationRule: {
      scope: "all",
      minimumWage: 2520,
    },
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
      high: 1480,
      middle: 3280,
      primaryCoreHigh: 3430,
      primaryCoreLow: 3330,
      primarySpecial: 3130,
    },
    // 考核工资浮动规则（制度：考核工资须"根据表现拉开差距"，合格全额、优秀上浮、不合格梯度扣减）
    // 月度考核结果录入后按此系数浮动；未录入时按 default 全额发放，与原固定档行为一致
    assessmentGrades: {
      excellent: { label: "优秀", rate: 1.2 },
      good: { label: "良好", rate: 1.1 },
      default: { label: "合格", rate: 1 },
      warning: { label: "基本合格", rate: 0.8 },
      unqualified: { label: "不合格", rate: 0.6 },
    },
    stageLessonRules: {
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
  "assessmentGrades",
  "probationRule",
  "stageLessonRules",
  "postAllowances",
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
  high: "高中专任",
  middle: "初中专任",
  primaryCoreHigh: "小学高段核心",
  primaryCoreLow: "小学低段核心",
  primarySpecial: "小学艺体信息心理",
};

// 考核档与学段绑定：小学老师不可能是"高中专任"，制度上考核工资标准本就按学段划分。
// 前端下拉按此收敛可选项，后端保存时按此校验，避免把老师配成跨学段的档位。
export const ASSESSMENT_BANDS_BY_STAGE = {
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

const PAYROLL_STAGE_LABELS = { primary: "小学", middle: "初中", high: "高中" };

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

// 考核工资 = 岗位标准额 × 月度考核系数
// 制度要求考核工资"根据表现拉开差距"；未录入月度考核结果时按合格（系数 1）发放，
// 与改造前的固定档行为一致，保证过渡期不产生金额跳变。
function assessmentComponent(teacher, profile, scheme, monthlyAssessment = null) {
  const band = profile.assessmentBand || defaultAssessmentBand(teacher);
  const standard = Number(scheme.assessmentSalary?.[band] || 0);
  const gradeKey = monthlyAssessment?.grade || "default";
  const gradeCfg = scheme.assessmentGrades?.[gradeKey] || scheme.assessmentGrades?.default || { label: "合格", rate: 1 };
  const rate = Number(gradeCfg.rate ?? 1);
  // 允许直接核定金额，覆盖系数计算（用于制度中的区间制岗位，如幼儿园）。
  // 注意 null/""/undefined 都表示"未核定"，不能用 Number() 判断——Number(null) 是 0。
  const rawAmount = monthlyAssessment?.amount;
  const hasOverride = rawAmount !== null && rawAmount !== undefined && rawAmount !== "" && Number.isFinite(Number(rawAmount));
  const amount = hasOverride ? Number(rawAmount) : standard * rate;
  const basis = hasOverride
    ? `考核档 ${assessmentBandLabel(band)}，按考核结果核定金额`
    : `考核档 ${assessmentBandLabel(band)}（标准 ${standard} 元）× ${gradeCfg.label} ${rate}`;
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
  const minimumWage = Number(rule.minimumWage || 0);
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

export function calculateDedicatedTeacherPayroll({
  teacher,
  lessons = [],
  month = "2026-06",
  payrollRules = {},
  getRoomName = () => "",
  // 人事联动（第二阶段 M4）：离职/入职当月固定项按在职天数折算，1 表示不折算
  fixedProrationFactor = 1,
  prorationNote = "",
  // 月度考核结果（0726 制度：考核工资须按表现拉开差距）
  // { grade: "excellent"|"good"|"default"|"warning"|"unqualified", amount?: number, note?: string }
  monthlyAssessment = null,
  // 人事档案事实：职称、学历、兼岗任命、入职日期。这些是人事维护的客观事实，
  // 薪资引擎只读取用于套标准，财务不可改（职责分离）。缺省时回落到工资档案，保证兼容。
  hrFacts = null,
} = {}) {
  const normalizedRules = normalizePayrollRules(payrollRules);
  const scheme = normalizedRules.teacherSalaryScheme;
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
  const sortedLessons = [...lessons].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const highRegularWeekUnits = new Map();
  const lines = sortedLessons.map((lesson) => {
    // 计薪口径：排给谁就算谁的，除非这节课被取消。
    //
    // 原来按「已签到完成」计薪，依赖教师逐节扫码签入签出——漏签一节就少一节的钱，
    // 而漏签的原因往往和上没上课无关（手机没电、二维码被挡住）。学校的规则是
    // 派了课就该上，于是签到只是在给一件本该确定的事引入不确定性。
    //
    // 代课与请假不需要在这里另做处理，课表已经反映了：
    //   代课  审批通过时课次的 teacherId 被改成代课教师，课就归代课老师了
    //   请假  审批时逐节安排，未安排代课的课次标记 cancelled，谁也不计
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
    degreeAllowanceComponent(profile, scheme),
    assessmentComponent(teacher, profile, scheme, monthlyAssessment),
    seniorityComponent(profile, scheme),
    housingComponent(profile, scheme),
    ...applyPostAllowancePolicy(roleComponents(teacher, profile, scheme), profile),
    ...manualComponents(profile),
  ]
    .filter((component) => component && component.amount)
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
  const components = applyProbationPolicy([...fixedComponents, lessonComponent], profile, scheme);
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
