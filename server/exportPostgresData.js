import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(PROJECT_ROOT, "server/data/phase1-db.json");
const DEFAULT_OUTPUT = path.join(PROJECT_ROOT, "database/postgres/generated/phase1-data.sql");

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlText(value, fallback = "") {
  return sqlString(value ?? fallback);
}

function sqlNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : String(fallback);
}

function sqlBoolean(value) {
  return value ? "true" : "false";
}

function sqlJson(value, fallback = {}) {
  return `${sqlString(JSON.stringify(value ?? fallback))}::jsonb`;
}

function insertSql(table, columns, values) {
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;`;
}

function gradeIdFor(stageId, gradeNo) {
  const grade = Number(gradeNo);
  if (stageId === "primary") return `elementary-g${grade}`;
  if (stageId === "middle") return `middle-g${Math.max(grade - 6, 1)}`;
  if (stageId === "high") return `high-g${Math.max(grade - 9, 1)}`;
  return `${stageId || "stage"}-g${grade || 0}`;
}

function gradeNameFor(stageId, gradeNo) {
  const grade = Number(gradeNo);
  if (stageId === "primary") return `${grade}年级`;
  if (stageId === "middle") return `初${Math.max(grade - 6, 1)}`;
  if (stageId === "high") return `高${Math.max(grade - 9, 1)}`;
  return `${grade || ""}年级`;
}

function timeRangeParts(timeRange = "") {
  const [start = "08:00", end = "08:40"] = String(timeRange || "").split("-");
  return { start: start.slice(0, 5), end: end.slice(0, 5) };
}

function normalizeLessonStatus(status = "scheduled") {
  if (status === "checkedIn") return "checked_in";
  if (["scheduled", "pending", "checked_in", "completed", "exception", "cancelled"].includes(status)) return status;
  return "scheduled";
}

function normalizeAttendanceAction(action = "") {
  if (action === "checkIn") return "check_in";
  if (action === "checkOut") return "check_out";
  return action === "check_out" ? "check_out" : "check_in";
}

function normalizePeriodType(type = "regular") {
  if (type === "selfStudy") return "self_study";
  if (["regular", "self_study", "activity", "evening_study"].includes(type)) return type;
  return "regular";
}

function normalizePayrollStatus(status = "saved") {
  const allowed = ["saved", "generated", "teacher_confirmed", "disputed", "reviewed", "locked"];
  return allowed.includes(status) ? status : "saved";
}

function currentTermId(db) {
  return db.terms?.find((term) => term.current)?.id || db.terms?.[0]?.id || "TERM-UNKNOWN";
}

function termIdForLesson(db, lesson) {
  const version = db.scheduleVersions?.find((item) => item.id === lesson.scheduleVersionId);
  if (version?.termId) return version.termId;
  const draft = db.scheduleDrafts?.find((item) => item.id === lesson.schedulingDraftId);
  if (draft?.termId) return draft.termId;
  return currentTermId(db);
}

function stageGradePairs(db) {
  const pairs = new Map();
  (db.stages || []).forEach((stage) => {
    (stage.grades || []).forEach((grade) => {
      pairs.set(`${stage.id}:${grade}`, { stageId: stage.id, grade });
    });
  });
  (db.classes || []).forEach((schoolClass) => {
    if (schoolClass.stageId && schoolClass.grade) {
      pairs.set(`${schoolClass.stageId}:${schoolClass.grade}`, { stageId: schoolClass.stageId, grade: schoolClass.grade });
    }
  });
  return [...pairs.values()];
}

function roomResourceTypes(db) {
  const types = new Map();
  types.set("homeroom", { id: "homeroom", name: "普通教室", capacity: 1, allowParallel: false });
  (db.rooms || []).forEach((room) => {
    if (room.roomType) {
      types.set(room.roomType, {
        id: room.roomType,
        name: room.roomTypeName || room.roomType,
        capacity: room.capacity || 1,
        allowParallel: false,
      });
    }
  });
  (db.roomResourceOverrides || []).forEach((override) => {
    (override.roomResourceTypes || []).forEach((type) => {
      types.set(type.type, {
        id: type.type,
        name: type.name || type.type,
        capacity: type.defaultCount || 1,
        allowParallel: false,
        metadata: type,
      });
    });
  });
  return [...types.values()];
}

function rowsForDraftAssignments(db) {
  return (db.scheduleDrafts || []).flatMap((draft) =>
    (draft.assignments || []).map((assignment, index) => {
      const times = timeRangeParts(assignment.time);
      return insertSql(
        "schedule_draft_assignments",
        [
          "id",
          "draft_id",
          "term_id",
          "class_id",
          "subject_id",
          "teacher_id",
          "room_id",
          "lesson_date",
          "period_no",
          "start_time",
          "end_time",
          "lesson_type",
          "units",
          "locked",
          "metadata",
        ],
        [
          sqlText(`${draft.id}:A${String(index + 1).padStart(4, "0")}`),
          sqlText(draft.id),
          sqlText(draft.termId || currentTermId(db)),
          sqlText(assignment.classId),
          sqlText(assignment.subjectId),
          sqlText(assignment.teacherId),
          sqlString(assignment.roomId),
          sqlText(assignment.date),
          sqlNumber(assignment.period, 1),
          sqlText(times.start),
          sqlText(times.end),
          sqlText(assignment.type || "regular"),
          sqlNumber(assignment.units, 1),
          sqlBoolean(Boolean(assignment.locked)),
          sqlJson(assignment),
        ],
      );
    }),
  );
}

function buildRows(db) {
  const rows = [];
  const currentTerm = currentTermId(db);
  const usedTeacherAccountIds = new Set();

  rows.push("-- Generated data export from server/data/phase1-db.json.");
  rows.push("BEGIN;");

  (db.terms || []).forEach((term) => {
    rows.push(
      insertSql(
        "academic_terms",
        [
          "id",
          "name",
          "school_year",
          "semester",
          "start_date",
          "end_date",
          "settlement_month",
          "status",
          "is_current",
          "copied_config_summary",
          "created_at",
          "updated_at",
        ],
        [
          sqlText(term.id),
          sqlText(term.name),
          sqlText(term.schoolYear),
          sqlText(term.semester),
          sqlText(term.startDate),
          sqlText(term.endDate),
          sqlString(term.settlementMonth),
          sqlText(term.status || (term.current ? "active" : "planned")),
          sqlBoolean(Boolean(term.current)),
          sqlJson({ divisionWeekStarts: term.divisionWeekStarts || {} }),
          sqlText(term.createdAt || db.meta?.createdAt),
          sqlText(term.updatedAt || db.meta?.updatedAt),
        ],
      ),
    );
  });

  (db.stages || []).forEach((stage, index) => {
    rows.push(
      insertSql(
        "school_stages",
        ["id", "name", "sort_order", "active"],
        [sqlText(stage.id), sqlText(stage.name), sqlNumber(index + 1), "true"],
      ),
    );
  });

  stageGradePairs(db).forEach((pair) => {
    rows.push(
      insertSql(
        "grades",
        ["id", "stage_id", "grade_no", "name", "sort_order", "active"],
        [
          sqlText(gradeIdFor(pair.stageId, pair.grade)),
          sqlText(pair.stageId),
          sqlNumber(pair.grade),
          sqlText(gradeNameFor(pair.stageId, pair.grade)),
          sqlNumber(pair.grade),
          "true",
        ],
      ),
    );
  });

  (db.subjects || []).forEach((subject, index) => {
    rows.push(
      insertSql(
        "subjects",
        ["id", "name", "category", "active", "sort_order"],
        [sqlText(subject.id), sqlText(subject.name), sqlText(subject.category || "regular"), "true", sqlNumber(index + 1)],
      ),
    );
  });

  roomResourceTypes(db).forEach((type) => {
    rows.push(
      insertSql(
        "room_resource_types",
        ["id", "name", "capacity", "allow_parallel", "active", "metadata"],
        [
          sqlText(type.id),
          sqlText(type.name),
          sqlNumber(type.capacity, 1),
          sqlBoolean(Boolean(type.allowParallel)),
          "true",
          sqlJson(type.metadata || {}),
        ],
      ),
    );
  });

  (db.classes || []).forEach((schoolClass) => {
    rows.push(
      insertSql(
        "classes",
        ["id", "term_id", "stage_id", "grade_id", "class_no", "name", "class_type", "student_count", "active", "metadata"],
        [
          sqlText(schoolClass.id),
          sqlText(schoolClass.termId || currentTerm),
          sqlText(schoolClass.stageId),
          sqlText(gradeIdFor(schoolClass.stageId, schoolClass.grade)),
          sqlNumber(String(schoolClass.id || "").match(/-(\d+)$/)?.[1] || schoolClass.classNo || 0),
          sqlText(schoolClass.name),
          sqlText(schoolClass.classType || "regular"),
          sqlNumber(schoolClass.studentCount, 0),
          sqlBoolean(schoolClass.active !== false),
          sqlJson(schoolClass),
        ],
      ),
    );
  });

  (db.rooms || []).forEach((room) => {
    rows.push(
      insertSql(
        "rooms",
        ["id", "term_id", "stage_id", "grade_id", "room_type_id", "name", "display_key", "capacity", "active", "metadata"],
        [
          sqlText(room.id),
          sqlString(room.termId),
          sqlString(room.stageId),
          sqlString(room.grade ? gradeIdFor(room.stageId, room.grade) : null),
          sqlString(room.roomType || "homeroom"),
          sqlText(room.name),
          sqlString(room.displayKey),
          sqlNumber(room.capacity, 1),
          sqlBoolean(room.active !== false),
          sqlJson(room),
        ],
      ),
    );
  });

  (db.teachers || []).forEach((teacher) => {
    rows.push(
      insertSql(
        "teachers",
        [
          "id",
          "employee_no",
          "name",
          "stage_id",
          "grade_id",
          "primary_subject_id",
          "department",
          "phone",
          "status",
          "hire_date",
          "metadata",
        ],
        [
          sqlText(teacher.id),
          sqlText(teacher.employeeNo || teacher.id),
          sqlText(teacher.name),
          sqlString(teacher.stageId),
          sqlString(teacher.grade ? gradeIdFor(teacher.stageId, teacher.grade) : null),
          sqlString(teacher.primarySubjectId),
          sqlString(teacher.department || teacher.stageName),
          sqlString(teacher.phone),
          sqlText(teacher.status || "active"),
          sqlString(teacher.hiredAt),
          sqlJson({ title: teacher.title, stageName: teacher.stageName, primarySubjectName: teacher.primarySubjectName }),
        ],
      ),
    );
  });

  (db.accounts || []).forEach((account) => {
    let teacherId = account.teacherId || null;
    if (teacherId && usedTeacherAccountIds.has(teacherId)) teacherId = null;
    if (teacherId) usedTeacherAccountIds.add(teacherId);
    rows.push(
      insertSql(
        "accounts",
        ["id", "username", "password_hash", "role", "status", "teacher_id", "name", "phone", "created_at", "updated_at"],
        [
          sqlText(account.id),
          sqlText(account.username),
          sqlText(account.passwordHash),
          sqlText(account.role),
          sqlText(account.status || "active"),
          sqlString(teacherId),
          sqlText(account.name),
          sqlString(account.phone),
          sqlText(account.createdAt || db.meta?.createdAt),
          sqlText(account.updatedAt || db.meta?.updatedAt),
        ],
      ),
    );
  });

  (db.teachers || []).forEach((teacher) => {
    if (!teacher.salaryProfile) return;
    rows.push(
      insertSql(
        "teacher_salary_profiles",
        [
          "id",
          "teacher_id",
          "term_id",
          "qualification_level",
          "assessment_level",
          "seniority_years",
          "housing_level",
          "role_flags",
          "supplemental_items",
          "manual_adjustments",
          "trial_ratio",
          "is_default",
          "created_at",
          "updated_at",
        ],
        [
          sqlText(`SALARY-${teacher.id}`),
          sqlText(teacher.id),
          sqlText(currentTerm),
          sqlString(teacher.salaryProfile.qualificationGrade),
          sqlString(teacher.salaryProfile.assessmentBand),
          sqlNumber(teacher.salaryProfile.schoolYears, 0),
          sqlString(teacher.salaryProfile.housingTier),
          sqlJson(teacher.salaryProfile.roles || {}),
          sqlJson(teacher.salaryProfile.supplementalItems || []),
          sqlJson(teacher.salaryProfile.manualItems || []),
          sqlNumber(teacher.salaryProfile.probationRate, 1),
          "true",
          sqlText(db.meta?.createdAt),
          sqlText(db.meta?.updatedAt),
        ],
      ),
    );
  });

  rows.push(
    insertSql(
      "payroll_rules",
      ["id", "version", "status", "rules", "created_at", "updated_at"],
      [
        "'PAYROLL-RULES-CURRENT'",
        sqlText(db.payrollRules?.teacherSalaryScheme?.version || "phase1-current"),
        "'active'",
        sqlJson(db.payrollRules || {}),
        sqlText(db.meta?.createdAt),
        sqlText(db.meta?.updatedAt),
      ],
    ),
  );

  (db.gradeCourseRules || []).forEach((rule) => {
    rows.push(
      insertSql(
        "grade_course_rules",
        [
          "id",
          "term_id",
          "stage_id",
          "grade_id",
          "subject_id",
          "weekly_lessons",
          "duration_minutes",
          "min_per_day",
          "max_per_day",
          "max_consecutive",
          "banned_periods",
          "preferred_time",
          "room_type_id",
          "active",
          "metadata",
        ],
        [
          sqlText(rule.id),
          sqlText(rule.termId || currentTerm),
          sqlText(rule.stageId),
          sqlText(gradeIdFor(rule.stageId, rule.grade)),
          sqlText(rule.subjectId),
          sqlNumber(rule.weeklyLessons, 0),
          sqlNumber(rule.durationMinutes, 40),
          sqlNumber(rule.minPerClassPerDay || rule.minPerDay, 0),
          sqlNumber(rule.maxPerClassPerDay || rule.maxPerDay, 0),
          sqlNumber(rule.maxConsecutive || 0),
          `ARRAY[${(rule.forbiddenPeriods || []).map((item) => Number(item)).filter(Number.isFinite).join(",")}]::integer[]`,
          sqlText(rule.preferredDayPart || "any"),
          sqlString(rule.roomType || rule.roomTypeId),
          sqlBoolean(rule.enabled !== false),
          sqlJson(rule),
        ],
      ),
    );
  });

  (db.teacherAssignments || []).forEach((assignment) => {
    Object.entries(assignment.classTeacherIds || {}).forEach(([classId, teacherIds]) => {
      (teacherIds || []).forEach((teacherId) => {
        rows.push(
          insertSql(
            "class_teacher_assignments",
            ["id", "term_id", "class_id", "subject_id", "teacher_id", "active", "created_at", "updated_at"],
            [
              sqlText(`CTA-${assignment.id}-${classId}-${teacherId}`),
              sqlText(assignment.termId || currentTerm),
              sqlText(classId),
              sqlText(assignment.subjectId),
              sqlText(teacherId),
              "true",
              sqlText(assignment.createdAt || assignment.updatedAt || db.meta?.createdAt),
              sqlText(assignment.updatedAt || db.meta?.updatedAt),
            ],
          ),
        );
      });
    });
  });

  (db.schedulePeriodTemplates || []).forEach((template) => {
    (template.periods || []).forEach((period) => {
      rows.push(
        insertSql(
          "schedule_period_templates",
          ["id", "term_id", "stage_id", "grade_id", "period_no", "start_time", "end_time", "period_type", "active", "created_at", "updated_at"],
          [
            sqlText(`${template.id}-P${period.period}`),
            sqlText(template.termId || currentTerm),
            sqlText(template.stageId),
            sqlText(gradeIdFor(template.stageId, template.grade)),
            sqlNumber(period.period, 1),
            sqlText(period.startTime),
            sqlText(period.endTime),
            sqlText(normalizePeriodType(period.type)),
            sqlBoolean(period.active !== false),
            sqlText(template.createdAt || template.updatedAt || db.meta?.createdAt),
            sqlText(template.updatedAt || db.meta?.updatedAt),
          ],
        ),
      );
    });
  });

  (db.scheduleConstraints || []).forEach((constraint) => {
    rows.push(
      insertSql(
        "schedule_constraints",
        ["id", "term_id", "stage_id", "grade_id", "subject_id", "teacher_id", "class_id", "constraint_type", "hard", "rule", "active", "created_by_account_id", "created_at", "updated_at"],
        [
          sqlText(constraint.id),
          sqlText(constraint.termId || currentTerm),
          sqlText(constraint.stageId),
          sqlText(gradeIdFor(constraint.stageId, constraint.grade)),
          sqlString(constraint.subjectId),
          sqlString(constraint.teacherId),
          sqlString(constraint.classId),
          sqlText(constraint.type),
          sqlBoolean(constraint.hard !== false),
          sqlJson(constraint),
          sqlBoolean(constraint.active !== false),
          sqlString(constraint.createdByAccountId),
          sqlText(constraint.createdAt || db.meta?.createdAt),
          sqlText(constraint.updatedAt || constraint.createdAt || db.meta?.updatedAt),
        ],
      ),
    );
  });

  (db.teacherScheduleRules || []).forEach((rule) => {
    rows.push(
      insertSql(
        "teacher_schedule_rules",
        ["id", "term_id", "teacher_id", "unavailable_slots", "preferences", "max_weekly_lessons", "active", "created_by_account_id", "created_at", "updated_at"],
        [
          sqlText(rule.id),
          sqlText(rule.termId || currentTerm),
          sqlText(rule.teacherId),
          sqlJson(rule.unavailableSlots || []),
          sqlJson({ avoidPeriods: rule.avoidPeriods || [], preferPeriods: rule.preferPeriods || [], maxDailyLessons: rule.maxDailyLessons, maxConsecutiveLessons: rule.maxConsecutiveLessons }),
          sqlNumber(rule.maxWeeklyLessons, 20),
          "true",
          sqlString(rule.updatedByAccountId),
          sqlText(rule.createdAt || rule.updatedAt || db.meta?.createdAt),
          sqlText(rule.updatedAt || db.meta?.updatedAt),
        ],
      ),
    );
  });

  (db.scheduleDrafts || []).forEach((draft) => {
    rows.push(
      insertSql(
        "schedule_drafts",
        ["id", "term_id", "stage_id", "grade_id", "week_start", "status", "version_no", "solver_status", "quality_score", "conflicts", "warnings", "metrics", "created_by_account_id", "created_at", "updated_at"],
        [
          sqlText(draft.id),
          sqlText(draft.termId || currentTerm),
          sqlText(draft.stageId),
          sqlText(draft.gradeId || gradeIdFor(draft.stageId, draft.grade)),
          sqlText(draft.weekStart),
          sqlText(draft.status || "draft"),
          sqlNumber(draft.versionNumber, 1),
          sqlString(draft.solver?.status || draft.solverStatus),
          sqlNumber(draft.qualityScore, 0),
          sqlJson(draft.conflicts || []),
          sqlJson(draft.warnings || []),
          sqlJson({ requiredLessonCount: draft.requiredLessonCount, generatedLessonCount: draft.generatedLessonCount, unassignedCount: draft.unassignedCount, solver: draft.solver || null }),
          sqlString(draft.createdByAccountId || draft.publishedByAccountId),
          sqlText(draft.generatedAt || db.meta?.createdAt),
          sqlText(draft.updatedAt || draft.publishedAt || draft.generatedAt || db.meta?.updatedAt),
        ],
      ),
    );
  });

  rows.push(...rowsForDraftAssignments(db));

  (db.scheduleVersions || []).forEach((version) => {
    rows.push(
      insertSql(
        "schedule_versions",
        ["id", "term_id", "draft_id", "stage_id", "grade_id", "version_no", "week_start", "published_by_account_id", "published_at", "snapshot", "active"],
        [
          sqlText(version.id),
          sqlText(version.termId || currentTerm),
          sqlString(version.draftId),
          sqlText(version.stageId),
          sqlText(version.gradeId || gradeIdFor(version.stageId, version.grade)),
          sqlNumber(version.versionNumber, 1),
          sqlText(version.weekStart),
          sqlString(version.publishedByAccountId),
          sqlText(version.publishedAt || db.meta?.updatedAt),
          sqlJson(version),
          sqlBoolean(version.current !== false),
        ],
      ),
    );
  });

  (db.lessonInstances || []).forEach((lesson) => {
    const times = timeRangeParts(lesson.time);
    rows.push(
      insertSql(
        "lesson_instances",
        [
          "id",
          "term_id",
          "schedule_version_id",
          "draft_assignment_id",
          "class_id",
          "teacher_id",
          "subject_id",
          "room_id",
          "lesson_date",
          "period_no",
          "start_time",
          "end_time",
          "class_name",
          "subject_name",
          "teacher_name",
          "room_name",
          "lesson_type",
          "units",
          "status",
          "check_in_at",
          "check_out_at",
          "attendance_note",
          "source",
          "metadata",
        ],
        [
          sqlText(lesson.id),
          sqlText(lesson.termId || termIdForLesson(db, lesson)),
          sqlString(lesson.scheduleVersionId),
          "NULL",
          sqlText(lesson.classId),
          sqlText(lesson.teacherId),
          sqlText(lesson.subjectId),
          sqlString(lesson.roomId),
          sqlText(lesson.date),
          sqlNumber(lesson.period, 1),
          sqlText(times.start),
          sqlText(times.end),
          sqlText(lesson.className),
          sqlText(lesson.subjectName),
          sqlText(lesson.teacherName || db.teachers?.find((teacher) => teacher.id === lesson.teacherId)?.name || ""),
          sqlString(lesson.room),
          sqlText(lesson.type || "regular"),
          sqlNumber(lesson.units, 1),
          sqlText(normalizeLessonStatus(lesson.status)),
          sqlString(lesson.checkInAt),
          sqlString(lesson.checkOutAt),
          sqlString(lesson.attendanceNote || lesson.note),
          sqlText(lesson.source || "backend-scheduling"),
          sqlJson(lesson),
        ],
      ),
    );
  });

  (db.attendanceRecords || []).forEach((record) => {
    rows.push(
      insertSql(
        "attendance_records",
        ["id", "lesson_id", "teacher_id", "room_id", "action", "status", "scanned_at", "source", "qr_token_id", "result_code", "result_text", "device_info", "created_at"],
        [
          sqlText(record.id),
          sqlString(record.lessonId),
          sqlText(record.teacherId),
          sqlString(record.roomId),
          sqlText(normalizeAttendanceAction(record.action)),
          sqlText(record.status || "accepted"),
          sqlText(record.occurredAt || record.createdAt),
          sqlText(record.source || "qr"),
          sqlString(record.qrTokenId),
          sqlText(record.resultCode || record.status || "accepted"),
          sqlText(record.resultText || record.reason || "migrated attendance record"),
          sqlJson({ room: record.room, checks: record.checks || [], createdByAccountId: record.createdByAccountId }),
          sqlText(record.createdAt || record.occurredAt),
        ],
      ),
    );
  });

  (db.workloadConfirmations || []).forEach((confirmation) => {
    rows.push(
      insertSql(
        "workload_confirmations",
        ["id", "teacher_id", "term_id", "month", "status", "stage", "summary_snapshot", "line_snapshot", "confirmed_at", "locked_at", "created_at", "updated_at"],
        [
          sqlText(confirmation.id),
          sqlText(confirmation.teacherId),
          sqlString(confirmation.termId),
          sqlText(confirmation.month),
          sqlText(confirmation.status || "unconfirmed"),
          sqlNumber(confirmation.stage, 0),
          sqlJson(confirmation.summarySnapshot || {}),
          sqlJson(confirmation.lineSnapshot || []),
          sqlString(confirmation.confirmedAt),
          sqlString(confirmation.lockedAt),
          sqlText(confirmation.createdAt || db.meta?.createdAt),
          sqlText(confirmation.updatedAt || db.meta?.updatedAt),
        ],
      ),
    );
  });

  (db.payrollDetails || []).forEach((detail) => {
    rows.push(
      insertSql(
        "payroll_details",
        [
          "id",
          "teacher_id",
          "term_id",
          "month",
          "status",
          "salary_scheme_version",
          "gross_pay",
          "summary_snapshot",
          "line_snapshots",
          "dispute_reason",
          "dispute_resolution",
          "generated_by_account_id",
          "generated_at",
          "saved_at",
          "published_at",
          "teacher_confirmed_at",
          "disputed_at",
          "reviewed_at",
          "locked_at",
          "unlocked_at",
          "unlock_history",
          "created_at",
          "updated_at",
        ],
        [
          sqlText(detail.id),
          sqlText(detail.teacherId),
          sqlString(detail.termId),
          sqlText(detail.month),
          sqlText(normalizePayrollStatus(detail.status)),
          sqlString(detail.summarySnapshot?.salarySchemeVersion),
          sqlNumber(detail.summarySnapshot?.grossPay, 0),
          sqlJson(detail.summarySnapshot || {}),
          sqlJson(detail.lineSnapshots || []),
          sqlString(detail.disputeReason),
          sqlString(detail.disputeResolution),
          sqlString(detail.generatedByAccountId || detail.savedByAccountId),
          sqlString(detail.generatedAt),
          sqlString(detail.savedAt),
          sqlString(detail.publishedAt),
          sqlString(detail.teacherConfirmedAt),
          sqlString(detail.disputedAt),
          sqlString(detail.reviewedAt),
          sqlString(detail.lockedAt),
          sqlString(detail.unlockedAt),
          sqlJson(detail.unlockHistory || []),
          sqlText(detail.createdAt || detail.generatedAt || db.meta?.createdAt),
          sqlText(detail.updatedAt || db.meta?.updatedAt),
        ],
      ),
    );
    (detail.rowsSnapshot || []).forEach((row, index) => {
      rows.push(
        insertSql(
          "payroll_detail_rows",
          ["id", "payroll_detail_id", "row_order", "item_name", "basis", "amount", "metadata"],
          [
            sqlText(`${detail.id}-ROW-${String(index + 1).padStart(3, "0")}`),
            sqlText(detail.id),
            sqlNumber(index + 1),
            sqlText(row.name),
            sqlString(row.basis),
            sqlNumber(row.amount, 0),
            sqlJson(row),
          ],
        ),
      );
    });
  });

  (db.payrollBatches || []).forEach((batch) => {
    rows.push(
      insertSql(
        "payroll_batches",
        ["id", "batch_type", "term_id", "month", "total", "success_count", "failed_count", "created_by_account_id", "created_at", "metadata"],
        [
          sqlText(batch.id),
          sqlText(batch.type || "generate"),
          sqlString(batch.termId),
          sqlText(batch.month),
          sqlNumber(batch.total, 0),
          sqlNumber(batch.successCount, 0),
          sqlNumber(batch.failedCount, 0),
          sqlString(batch.createdByAccountId),
          sqlText(batch.createdAt || db.meta?.updatedAt),
          sqlJson(batch),
        ],
      ),
    );
    (batch.results || []).forEach((result, index) => {
      rows.push(
        insertSql(
          "payroll_batch_results",
          ["id", "payroll_batch_id", "teacher_id", "ok", "status", "gross_pay", "error", "details"],
          [
            sqlText(`${batch.id}-R${String(index + 1).padStart(5, "0")}`),
            sqlText(batch.id),
            sqlString(result.teacherId),
            sqlBoolean(Boolean(result.ok)),
            sqlString(result.status),
            sqlNumber(result.grossPay, 0),
            sqlString(result.error),
            sqlJson(result),
          ],
        ),
      );
    });
  });

  (db.notifications || []).forEach((notification) => {
    rows.push(
      insertSql(
        "notifications",
        ["id", "title", "body", "sender_account_id", "scope", "target_stage_id", "target_grade_id", "target_teacher_id", "created_at", "metadata"],
        [
          sqlText(notification.id),
          sqlText(notification.title),
          sqlText(notification.text || notification.body),
          sqlString(notification.createdByAccountId),
          sqlText(notification.audience || "all_teachers"),
          sqlString(notification.stageId),
          sqlString(notification.grade ? gradeIdFor(notification.stageId, notification.grade) : null),
          sqlString((notification.teacherIds || [])[0]),
          sqlText(notification.createdAt || db.meta?.updatedAt),
          sqlJson(notification),
        ],
      ),
    );
    (notification.accountIds || notification.readByAccountIds || []).forEach((accountId) => {
      const receipt = (notification.readReceipts || []).find((item) => item.accountId === accountId);
      const readAt = receipt?.readAt || ((notification.readByAccountIds || []).includes(accountId) ? notification.createdAt : "");
      rows.push(
        insertSql(
          "notification_recipients",
          ["id", "notification_id", "account_id", "teacher_id", "read_at", "created_at"],
          [
            sqlText(`${notification.id}-${accountId}`),
            sqlText(notification.id),
            sqlText(accountId),
            sqlString(receipt?.teacherId),
            sqlString(readAt),
            sqlText(notification.createdAt || db.meta?.updatedAt),
          ],
        ),
      );
    });
  });

  (db.auditLogs || []).forEach((log) => {
    rows.push(
      insertSql(
        "audit_logs",
        ["action", "actor_account_id", "actor_name", "teacher_id", "term_id", "month", "entity_type", "entity_id", "details", "created_at"],
        [
          sqlText(log.action),
          sqlString(log.actorAccountId),
          sqlString(log.actorName),
          sqlString(log.teacherId),
          sqlString(log.termId),
          sqlString(log.month),
          sqlString(log.entityType),
          sqlString(log.entityId || log.assignmentId),
          sqlJson(log),
          sqlText(log.createdAt || db.meta?.updatedAt),
        ],
      ),
    );
  });

  rows.push("COMMIT;");
  return rows;
}

export function buildPostgresSeedSql(db) {
  const rows = buildRows(db);
  return {
    sql: `${rows.join("\n")}\n`,
    summary: {
      terms: db.terms?.length || 0,
      teachers: db.teachers?.length || 0,
      accounts: db.accounts?.length || 0,
      lessons: db.lessonInstances?.length || 0,
      attendanceRecords: db.attendanceRecords?.length || 0,
      payrollDetails: db.payrollDetails?.length || 0,
      statements: rows.length,
    },
  };
}

function argValue(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

async function main() {
  const input = path.resolve(argValue("--input", DEFAULT_INPUT));
  const output = path.resolve(argValue("--output", DEFAULT_OUTPUT));
  const db = JSON.parse(await fs.readFile(input, "utf8"));
  const { sql, summary } = buildPostgresSeedSql(db);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, sql, "utf8");
  console.log(JSON.stringify({ output, summary }, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
