// 三方对账与差异台账（验收 8.12 / 8.13 / 8.14）
//
// 8.12 人事在岗人数 vs 当月核算工资人数
// 8.13 排课总课时 vs 薪资课时费所依据的课时
// 8.14 出现差异时自动生成差异台账提醒
//
// 这三条是账套里对学校最有实际价值的部分：人事说在岗 1002 人、财务算了 998 人
// 的工资，差的 4 个是谁——这正是学校要系统来管的事，以前只能靠人工核。
//
// 一个贯穿的设计取舍：**差异必须能落到具体的人和具体的课**，不能只报一个
// 「相差 4 人」的数字。报数字等于把活儿又推回给人工：财务还得自己去两张表里
// 一行行比对。差异台账要直接给出「这 4 个人是谁、属于哪种情况」。

import { buildRoster } from "./ledgers.js";

const DIFF_KINDS = {
  missing_payroll: { label: "在岗但无工资单", severity: "error" },
  extra_payroll: { label: "有工资单但不在岗", severity: "error" },
  unit_mismatch: { label: "课时数与计薪课时不符", severity: "error" },
  uncounted_lesson: { label: "有课但未计薪", severity: "warn" },
  zero_pay: { label: "有课时但课时费为零", severity: "warn" },
};

export function diffKindLabel(kind) {
  return DIFF_KINDS[kind]?.label || kind;
}

function round2(v) {
  return Math.round((Number(v) || 0) * 100) / 100;
}

/**
 * 8.12：人事在岗人数 vs 当月核算工资人数。
 *
 * 只比总数是不够的——「1002 对 998」这种结论没法行动。要给出具体是哪几个人，
 * 以及是哪一类情况：新入职漏建工资单、已离职却仍在发、还是根本没核算。
 */
export function reconcileHeadcount(db, month) {
  const roster = buildRoster(db, { asOfMonth: month });
  const details = (db.payrollDetails || []).filter((d) => d.month === month);

  // 工资单挂在 teacherId 上，人事档案挂在 employeeId 上，要经 teacherId 搭桥。
  // 没有 teacherId 的员工（纯行政后勤）不参与课时口径，但仍应有工资。
  const paidTeacherIds = new Set(details.map((d) => d.teacherId));
  const rosterByTeacherId = new Map();
  roster.inService.forEach((r) => {
    if (r.teacherId) rosterByTeacherId.set(r.teacherId, r);
  });

  const missingPayroll = roster.inService
    .filter((r) => r.teacherId && !paidTeacherIds.has(r.teacherId))
    .map((r) => ({
      kind: "missing_payroll",
      employeeId: r.employeeId,
      teacherId: r.teacherId,
      name: r.name,
      employeeNo: r.employeeNo,
      detail: r.hiredAt ? `${r.hiredAt} 入职` : "",
    }));

  const leftByTeacherId = new Set(roster.left.map((r) => r.teacherId).filter(Boolean));
  const extraPayroll = details
    .filter((d) => !rosterByTeacherId.has(d.teacherId))
    .map((d) => {
      const teacher = (db.teachers || []).find((t) => t.id === d.teacherId);
      return {
        kind: "extra_payroll",
        teacherId: d.teacherId,
        name: teacher?.name || d.teacherId,
        employeeNo: teacher?.employeeNo || "",
        // 区分「已离职仍在发」和「查无此人」——前者是流程没跟上，
        // 后者是数据问题，处理方式完全不同
        detail: leftByTeacherId.has(d.teacherId) ? "已离职，仍生成了工资单" : "人事档案中无在岗记录",
        amount: round2(d.summarySnapshot?.grossPay),
      };
    });

  return {
    month,
    hrInService: roster.inServiceCount,
    hrLeft: roster.leftCount,
    payrollCount: details.length,
    balanced: missingPayroll.length === 0 && extraPayroll.length === 0,
    differences: [...missingPayroll, ...extraPayroll],
  };
}

/**
 * 8.13：排课总课时 vs 薪资课时费所依据的课时。
 *
 * 比的是「排给教师的课次」与「工资单里计了薪的课时」。两者对不上意味着
 * 有人上了课没拿到钱，或者拿了不该拿的钱——都是要当月查清的。
 */
export function reconcileWorkload(db, month, options = {}) {
  const { lessons: providedLessons } = options;
  const monthPrefix = `${month}-`;
  const lessons = (providedLessons || db.lessonInstances || []).filter(
    (l) => String(l.date || "").startsWith(monthPrefix),
  );

  // 排课侧：排给教师的课都算工作量，只有取消的不算——
  // 与工资侧的计薪口径必须完全一致，否则这张对账表天天报差异，
  // 报的却是两边算法不同，不是真的对不平。
  const scheduledUnits = new Map();
  let totalScheduled = 0;
  lessons
    .filter((l) => l.status !== "cancelled")
    .forEach((l) => {
      const units = Number(l.units) || 1;
      scheduledUnits.set(l.teacherId, round2((scheduledUnits.get(l.teacherId) || 0) + units));
      totalScheduled = round2(totalScheduled + units);
    });

  // 薪资侧：工资单快照里记的可计薪课时
  const details = (db.payrollDetails || []).filter((d) => d.month === month);
  const paidUnits = new Map();
  let totalPaid = 0;
  let totalLessonAmount = 0;
  details.forEach((d) => {
    const units = Number(d.summarySnapshot?.payableUnits) || 0;
    paidUnits.set(d.teacherId, units);
    totalPaid = round2(totalPaid + units);
    totalLessonAmount = round2(totalLessonAmount + (Number(d.summarySnapshot?.lessonAmount) || 0));
  });

  const differences = [];
  const teacherIds = new Set([...scheduledUnits.keys(), ...paidUnits.keys()]);
  teacherIds.forEach((teacherId) => {
    const scheduled = scheduledUnits.get(teacherId) || 0;
    const paid = paidUnits.get(teacherId);
    const teacher = (db.teachers || []).find((t) => t.id === teacherId);
    const name = teacher?.name || teacherId;

    // 没有工资单的，归 8.12 管，这里不重复报——同一个问题在两张表里各报一次，
    // 会让人以为有两个问题
    if (paid === undefined) {
      if (scheduled > 0) {
        differences.push({
          kind: "uncounted_lesson",
          teacherId,
          name,
          employeeNo: teacher?.employeeNo || "",
          scheduledUnits: scheduled,
          paidUnits: 0,
          detail: `本月排了 ${scheduled} 课时，但没有工资单——常见于代课改派到了不在本次核算范围内的教师`,
        });
      }
      return;
    }

    if (round2(scheduled) !== round2(paid)) {
      differences.push({
        kind: "unit_mismatch",
        teacherId,
        name,
        employeeNo: teacher?.employeeNo || "",
        scheduledUnits: scheduled,
        paidUnits: paid,
        gap: round2(scheduled - paid),
        detail: `排课 ${scheduled} 课时，计薪 ${paid} 课时，相差 ${round2(scheduled - paid)}`,
      });
    }

    const detail = details.find((d) => d.teacherId === teacherId);
    const amount = Number(detail?.summarySnapshot?.lessonAmount) || 0;
    if (paid > 0 && amount === 0) {
      differences.push({
        kind: "zero_pay",
        teacherId,
        name,
        employeeNo: teacher?.employeeNo || "",
        scheduledUnits: scheduled,
        paidUnits: paid,
        detail: `计薪 ${paid} 课时，但课时费为 0 元`,
      });
    }
  });

  return {
    month,
    totalScheduledUnits: totalScheduled,
    totalPaidUnits: totalPaid,
    totalLessonAmount,
    gap: round2(totalScheduled - totalPaid),
    balanced: differences.length === 0,
    differences,
  };
}

/**
 * 8.12 + 8.13 + 8.14：跑完整对账，有差异就生成差异台账并提醒。
 *
 * 差异台账是一条记录，不是一次性的界面输出——8.14 说的是「自动生成差异台账
 * 提醒」，现场会去查这条记录。跑完就丢的结果满足不了它。
 */
export function runReconciliation(db, month, options = {}, actorAccount = null) {
  const { persist = true, notify = true } = options;
  const headcount = reconcileHeadcount(db, month);
  const workload = reconcileWorkload(db, month, options);

  const differences = [
    ...headcount.differences,
    ...workload.differences,
  ].map((d) => ({ ...d, severity: DIFF_KINDS[d.kind]?.severity || "warn", kindLabel: diffKindLabel(d.kind) }));

  const errorCount = differences.filter((d) => d.severity === "error").length;
  const now = new Date().toISOString();
  const report = {
    id: `RECON-${month}`,
    month,
    ranAt: now,
    ranByName: actorAccount?.name || actorAccount?.username || "系统",
    headcount: {
      hrInService: headcount.hrInService,
      hrLeft: headcount.hrLeft,
      payrollCount: headcount.payrollCount,
      balanced: headcount.balanced,
    },
    workload: {
      totalScheduledUnits: workload.totalScheduledUnits,
      totalPaidUnits: workload.totalPaidUnits,
      totalLessonAmount: workload.totalLessonAmount,
      gap: workload.gap,
      balanced: workload.balanced,
    },
    balanced: differences.length === 0,
    errorCount,
    warnCount: differences.length - errorCount,
    differences,
  };

  if (persist) {
    if (!Array.isArray(db.reconciliations)) db.reconciliations = [];
    // 同月重跑覆盖上一次：保留多份历史会让人不知道该看哪一份，
    // 而对账的意义是「当前对不对得平」
    const index = db.reconciliations.findIndex((r) => r.month === month);
    if (index >= 0) db.reconciliations[index] = report;
    else db.reconciliations.push(report);
  }

  // 8.14：有差异才提醒。没差异也推一条会让人很快学会忽略这类通知
  if (notify && differences.length > 0 && Array.isArray(db.notifications)) {
    db.notifications.push({
      id: `NTF-RECON-${month}-${Date.now()}`,
      audience: "finance",
      teacherIds: [],
      accountIds: [],
      title: `${month} 对账发现 ${differences.length} 项差异`,
      text:
        `人事在岗 ${headcount.hrInService} 人、核算 ${headcount.payrollCount} 人；` +
        `排课 ${workload.totalScheduledUnits} 课时、计薪 ${workload.totalPaidUnits} 课时。` +
        `其中需处理 ${errorCount} 项，详见对账台账。`,
      source: "账套对账",
      level: errorCount > 0 ? "warning" : "info",
      createdAt: now,
      createdByAccountId: "SYSTEM",
      createdByName: "账套对账",
      readByAccountIds: [],
    });
  }

  return report;
}

export function latestReconciliation(db, month) {
  return (db.reconciliations || []).find((r) => r.month === month) || null;
}

export { DIFF_KINDS };
