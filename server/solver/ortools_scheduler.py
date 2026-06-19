#!/usr/bin/env python3
import json
import math
import sys
import time
from datetime import datetime, timedelta


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))


DEFAULT_DURATION = 40
CORE_SUBJECT_IDS = {"chinese", "math", "english", "physics", "chemistry"}
ACTIVITY_SUBJECT_IDS = {"pe", "music", "art"}


def add_days(date_key, days):
    date = datetime.strptime(date_key, "%Y-%m-%d") + timedelta(days=days)
    return date.strftime("%Y-%m-%d")


def slot_key(date, period):
    return f"{date}-{period}"


def pad(number, length=2):
    return str(number).zfill(length)


def next_assignment_id(used_ids, class_id, subject_id, next_index):
    index = next_index
    assignment_id = f"SCH-{class_id}-{subject_id}-{pad(index)}"
    while assignment_id in used_ids:
        index += 1
        assignment_id = f"SCH-{class_id}-{subject_id}-{pad(index)}"
    used_ids.add(assignment_id)
    return assignment_id, index


def period_cost(subject, period):
    subject_id = subject.get("id")
    weekly_lessons = int(subject.get("weeklyLessons") or 0)
    is_core = subject_id in CORE_SUBJECT_IDS or weekly_lessons >= 3
    if subject_id in ACTIVITY_SUBJECT_IDS:
        if period <= 2:
            return 5
        if period >= 5:
            return 0
        return 2
    if is_core:
        if period >= 5:
            return 6
        if period == 4:
            return 2
        return 0
    return 2 if period >= 5 else 1


def period_day_part(period):
    return "morning" if int(period) <= 4 else "afternoon"


def subject_preference_cost(subject, period):
    preferred = subject.get("preferredDayPart") or "any"
    if preferred == "any":
        return 0
    return -2 if period_day_part(period) == preferred else 10


def subject_forbidden_period(subject, period):
    periods = [int(value) for value in subject.get("forbiddenPeriods") or []]
    return int(period) in periods


def constraint_applies(constraint, subject_id, day_index, period):
    if not constraint or constraint.get("active") is False:
        return False
    if constraint.get("subjectId") != subject_id:
        return False
    day_indexes = [int(value) for value in constraint.get("dayIndexes") or []]
    periods = [int(value) for value in constraint.get("periods") or []]
    if day_indexes and int(day_index) not in day_indexes:
        return False
    if periods and int(period) not in periods:
        return False
    return True


def teacher_rules(config):
    return {rule.get("teacherId"): rule for rule in config.get("teacherRules") or [] if rule.get("teacherId")}


def teacher_unavailable(rule, day_index, period):
    if not rule:
        return False
    for slot in rule.get("unavailableSlots") or []:
        periods = [int(value) for value in slot.get("periods") or []]
        if int(slot.get("dayIndex", -1)) == int(day_index) and int(period) in periods:
            return True
    return False


def teacher_preference_cost(rule, period):
    if not rule:
        return 0
    period = int(period)
    avoid_periods = [int(value) for value in rule.get("avoidPeriods") or []]
    prefer_periods = [int(value) for value in rule.get("preferPeriods") or []]
    cost = 0
    if period in avoid_periods:
        cost += 12
    if prefer_periods and period not in prefer_periods:
        cost += 4
    if period in prefer_periods:
        cost -= 2
    return cost


def count_locked_by_class_subject(locked_assignments):
    counts = {}
    for assignment in locked_assignments:
        key = (assignment.get("classId"), assignment.get("subjectId"))
        counts[key] = counts.get(key, 0) + 1
    return counts


def build_slots(config):
    slots = []
    for day_index in range(5):
        date = add_days(config["weekStart"], day_index)
        for period in config.get("periods") or []:
            slots.append(
                {
                    **period,
                    "date": date,
                    "dayIndex": day_index,
                    "slotKey": slot_key(date, int(period["period"])),
                }
            )
    return slots


def normalize_locked(config, assignment):
    periods = {int(item["period"]): item for item in config.get("periods") or []}
    classes = {item["id"]: item for item in config.get("classes") or []}
    subjects = {item["id"]: item for item in config.get("subjects") or []}
    rooms = {item["id"]: item for item in config.get("rooms") or []}
    school_class = classes.get(assignment.get("classId"), {})
    subject = subjects.get(assignment.get("subjectId"), {})
    period = periods.get(int(assignment.get("period") or 0), {})
    room = rooms.get(assignment.get("roomId")) or rooms.get(school_class.get("roomId")) or {}
    return {
        **assignment,
        "className": assignment.get("className") or school_class.get("name") or assignment.get("classId"),
        "durationMinutes": assignment.get("durationMinutes") or subject.get("durationMinutes") or DEFAULT_DURATION,
        "dayIndex": assignment.get("dayIndex"),
        "time": assignment.get("time") or period.get("time") or "",
        "roomId": room.get("id") or assignment.get("roomId") or school_class.get("roomId") or "",
        "room": room.get("name") or assignment.get("room") or school_class.get("room") or "",
        "locked": True,
    }


def build_tasks(config, locked_assignments):
    used_ids = {assignment.get("id") for assignment in locked_assignments if assignment.get("id")}
    existing_counts = count_locked_by_class_subject(locked_assignments)
    tasks = []
    for class_index, school_class in enumerate(config.get("classes") or []):
        for subject_index, subject in enumerate(config.get("subjects") or []):
            key = (school_class["id"], subject["id"])
            remaining = max(int(subject.get("weeklyLessons") or 0) - existing_counts.get(key, 0), 0)
            for _ in range(remaining):
                lesson_number = existing_counts.get(key, 0) + 1
                assignment_id, next_index = next_assignment_id(
                    used_ids,
                    school_class["id"],
                    subject["id"],
                    lesson_number,
                )
                existing_counts[key] = next_index
                tasks.append(
                    {
                        "id": assignment_id,
                        "classId": school_class["id"],
                        "className": school_class["name"],
                        "classIndex": class_index,
                        "room": school_class.get("room") or "",
                        "roomId": school_class.get("roomId") or "",
                        "subjectId": subject["id"],
                        "subjectName": subject["name"],
                        "subjectIndex": subject_index,
                        "subject": subject,
                        "teacherIds": subject.get("teacherIds") or [],
                        "durationMinutes": subject.get("durationMinutes") or DEFAULT_DURATION,
                    }
                )
    return tasks


def assignment_from_candidate(config, task, candidate):
    teachers = {item["id"]: item for item in config.get("teachers") or []}
    rooms = {item["id"]: item for item in config.get("rooms") or []}
    slot = candidate["slot"]
    room = rooms.get(task.get("roomId")) or {}
    teacher = teachers.get(candidate["teacherId"]) or {}
    return {
        "id": task["id"],
        "classId": task["classId"],
        "className": task["className"],
        "subjectId": task["subjectId"],
        "subjectName": task["subjectName"],
        "durationMinutes": task["durationMinutes"],
        "teacherId": candidate["teacherId"],
        "teacherName": teacher.get("name") or candidate["teacherId"],
        "date": slot["date"],
        "dayIndex": slot["dayIndex"],
        "period": int(slot["period"]),
        "time": slot.get("time") or "",
        "room": room.get("name") or task.get("room") or "",
        "roomId": room.get("id") or task.get("roomId") or "",
    }


def select_candidate_specs(candidate_specs, candidate_limit):
    if candidate_limit <= 0 or len(candidate_specs) <= candidate_limit:
        return candidate_specs

    sorted_specs = sorted(candidate_specs, key=lambda item: item["cost"])
    selected = []
    selected_keys = set()

    def candidate_key(candidate_spec):
        slot = candidate_spec["slot"]
        return (candidate_spec["teacherId"], slot["date"], int(slot["period"]))

    def add(candidate_spec):
        key = candidate_key(candidate_spec)
        if key in selected_keys:
            return False
        selected.append(candidate_spec)
        selected_keys.add(key)
        return len(selected) >= candidate_limit

    best_count = max(12, int(candidate_limit * 0.35))
    for candidate_spec in sorted_specs[:best_count]:
        if add(candidate_spec):
            return selected

    coverage_getters = [
        lambda item: ("day", item["slot"]["dayIndex"]),
        lambda item: ("period", int(item["slot"]["period"])),
        lambda item: ("teacher", item["teacherId"]),
        lambda item: ("teacher_day", item["teacherId"], item["slot"]["dayIndex"]),
        lambda item: ("day_period", item["slot"]["dayIndex"], int(item["slot"]["period"])),
    ]

    for coverage_getter in coverage_getters:
        grouped = {}
        for candidate_spec in sorted_specs:
            key = coverage_getter(candidate_spec)
            if key not in grouped:
                grouped[key] = candidate_spec
        for candidate_spec in grouped.values():
            if add(candidate_spec):
                return selected

    for candidate_spec in sorted_specs:
        if add(candidate_spec):
            return selected

    return selected


def solver_diagnostic(severity, key, title, text, details=None):
    return {
        "severity": severity,
        "key": key,
        "title": title,
        "text": text,
        "details": details or {},
    }


def candidate_task_report(task, candidate_specs):
    teacher_ids = sorted({candidate["teacherId"] for candidate in candidate_specs})
    day_indexes = sorted({int(candidate["slot"]["dayIndex"]) for candidate in candidate_specs})
    periods = sorted({int(candidate["slot"]["period"]) for candidate in candidate_specs})
    return {
        "taskId": task["id"],
        "classId": task["classId"],
        "className": task["className"],
        "subjectId": task["subjectId"],
        "subjectName": task["subjectName"],
        "candidateCount": len(candidate_specs),
        "teacherCount": len(teacher_ids),
        "teacherIds": teacher_ids[:8],
        "dayIndexes": day_indexes,
        "periods": periods,
    }


def build_solver_diagnostics(task_reports, teacher_task_demand, teacher_candidate_counts, config):
    diagnostics = []
    if not task_reports:
        return diagnostics

    constrained_tasks = sorted(task_reports, key=lambda item: item["candidateCount"])[:5]
    min_candidate_count = constrained_tasks[0]["candidateCount"] if constrained_tasks else 0
    if min_candidate_count == 0:
        zero_count = sum(1 for item in task_reports if item["candidateCount"] == 0)
        sample = "、".join(
            f"{item['className']}{item['subjectName']}" for item in constrained_tasks if item["candidateCount"] == 0
        )
        diagnostics.append(
            solver_diagnostic(
                "error",
                "cp_sat_zero_candidate_tasks",
                f"{zero_count} 个课时任务没有候选",
                f"{sample or '部分课程'}在老师、时间、课程禁排和占用规则过滤后没有可用候选。",
                {"zeroCandidateCount": zero_count, "tasks": constrained_tasks},
            )
        )
    else:
        sample = "、".join(
            f"{item['className']}{item['subjectName']}({item['candidateCount']} 个)"
            for item in constrained_tasks[:3]
        )
        diagnostics.append(
            solver_diagnostic(
                "warning" if min_candidate_count <= 3 else "info",
                "cp_sat_tight_candidate_tasks",
                "候选最少课时任务",
                f"{sample} 的可选空间最紧，若求解较慢或质量不佳，优先放宽这些课程的限制。",
                {"tasks": constrained_tasks},
            )
        )

    teachers_by_id = {teacher["id"]: teacher for teacher in config.get("teachers") or []}
    teacher_density = []
    for teacher_id, demand in teacher_task_demand.items():
        if demand <= 0:
            continue
        candidate_count = teacher_candidate_counts.get(teacher_id, 0)
        teacher_density.append(
            {
                "teacherId": teacher_id,
                "teacherName": (teachers_by_id.get(teacher_id) or {}).get("name") or teacher_id,
                "demand": demand,
                "candidateCount": candidate_count,
                "density": candidate_count / max(demand, 1),
            }
        )

    tight_teachers = sorted(teacher_density, key=lambda item: (item["density"], item["candidateCount"]))[:5]
    if tight_teachers:
        sample = "、".join(
            f"{item['teacherName']}({item['candidateCount']}候选/{item['demand']}需求)"
            for item in tight_teachers[:3]
        )
        diagnostics.append(
            solver_diagnostic(
                "warning" if tight_teachers[0]["density"] < 5 else "info",
                "cp_sat_tight_teachers",
                "老师资源紧张度",
                f"{sample}，这些老师的可用候选相对较少，可能成为排课瓶颈。",
                {"teachers": tight_teachers},
            )
        )

    return diagnostics


def configure_solver(cp_model, seconds, workers):
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = max(float(seconds or 1), 1.0)
    solver.parameters.num_search_workers = int(workers or 8)
    return solver


def solve(payload):
    try:
        from ortools.sat.python import cp_model
    except Exception as exc:  # pragma: no cover - depends on local environment
        return {
            "ok": False,
            "error": "OR_TOOLS_NOT_AVAILABLE",
            "message": str(exc),
        }

    started = time.time()
    config = payload["config"]
    options = payload.get("options") or {}
    locked_assignments = [
        normalize_locked(config, assignment)
        for assignment in payload.get("lockedAssignments") or []
        if assignment.get("locked")
    ]
    external_assignments = payload.get("externalAssignments") or []
    slots = build_slots(config)
    tasks = build_tasks(config, locked_assignments)
    rules_by_teacher = teacher_rules(config)

    teacher_busy = set()
    room_busy = set()
    class_busy = set()
    class_subject_day_locked = {}
    class_subject_day_period_locked = {}
    teacher_fixed_load = {}
    teacher_fixed_day_load = {}
    teacher_fixed_day_periods = {}

    for assignment in external_assignments:
        key = slot_key(assignment.get("date"), int(assignment.get("period") or 0))
        teacher_busy.add((assignment.get("teacherId"), key))
        if assignment.get("roomId") or assignment.get("room"):
            room_busy.add((assignment.get("roomId") or assignment.get("room"), key))
        teacher_fixed_load[assignment.get("teacherId")] = teacher_fixed_load.get(assignment.get("teacherId"), 0) + 1
        teacher_day_key = (assignment.get("teacherId"), assignment.get("date"))
        teacher_fixed_day_load[teacher_day_key] = teacher_fixed_day_load.get(teacher_day_key, 0) + 1
        teacher_fixed_day_periods.setdefault(teacher_day_key, set()).add(int(assignment.get("period") or 0))

    for assignment in locked_assignments:
        key = slot_key(assignment.get("date"), int(assignment.get("period") or 0))
        teacher_busy.add((assignment.get("teacherId"), key))
        room_busy.add((assignment.get("roomId") or assignment.get("room"), key))
        class_busy.add((assignment.get("classId"), key))
        day_key = (assignment.get("classId"), assignment.get("subjectId"), assignment.get("date"))
        class_subject_day_locked[day_key] = class_subject_day_locked.get(day_key, 0) + 1
        day_period_key = (
            assignment.get("classId"),
            assignment.get("subjectId"),
            assignment.get("date"),
            int(assignment.get("period") or 0),
        )
        class_subject_day_period_locked[day_period_key] = class_subject_day_period_locked.get(day_period_key, 0) + 1
        teacher_fixed_load[assignment.get("teacherId")] = teacher_fixed_load.get(assignment.get("teacherId"), 0) + 1
        teacher_day_key = (assignment.get("teacherId"), assignment.get("date"))
        teacher_fixed_day_load[teacher_day_key] = teacher_fixed_day_load.get(teacher_day_key, 0) + 1
        teacher_fixed_day_periods.setdefault(teacher_day_key, set()).add(int(assignment.get("period") or 0))

    model = cp_model.CpModel()
    task_vars = {}
    candidates_by_var = {}
    teacher_slot_vars = {}
    class_slot_vars = {}
    room_slot_vars = {}
    class_subject_day_vars = {}
    teacher_vars = {}
    teacher_day_vars = {}
    teacher_day_period_vars = {}
    class_day_vars = {}
    class_subject_day_period_vars = {}
    objective_terms = []
    candidate_limit = int(options.get("candidateLimit") or 64)
    subjects_by_id = {subject["id"]: subject for subject in config.get("subjects") or []}
    task_reports = []
    teacher_task_demand = {}
    teacher_candidate_counts = {}

    for task_index, task in enumerate(tasks):
        task_vars[task_index] = []
        candidate_specs = []
        for teacher_id in task.get("teacherIds") or []:
            teacher_task_demand[teacher_id] = teacher_task_demand.get(teacher_id, 0) + 1
        for slot in slots:
            if (task["classId"], slot["slotKey"]) in class_busy:
                continue
            if (task["roomId"], slot["slotKey"]) in room_busy:
                continue
            if subject_forbidden_period(task["subject"], int(slot["period"])):
                continue
            if any(
                constraint_applies(constraint, task["subjectId"], slot["dayIndex"], int(slot["period"]))
                for constraint in config.get("constraints") or []
            ):
                continue
            for teacher_id in task.get("teacherIds") or []:
                rule = rules_by_teacher.get(teacher_id)
                if (teacher_id, slot["slotKey"]) in teacher_busy:
                    continue
                if teacher_unavailable(rule, slot["dayIndex"], int(slot["period"])):
                    continue
                candidate_specs.append(
                    {
                        "slot": slot,
                        "teacherId": teacher_id,
                        "cost": period_cost(task["subject"], int(slot["period"]))
                        + subject_preference_cost(task["subject"], int(slot["period"]))
                        + teacher_preference_cost(rule, int(slot["period"]))
                        + int(slot["period"]) * 0.25
                        + int(slot["dayIndex"]) * 0.15
                        + teacher_fixed_load.get(teacher_id, 0) * 3,
                    }
                )

        task_reports.append(candidate_task_report(task, candidate_specs))
        for candidate_spec in candidate_specs:
            teacher_id = candidate_spec["teacherId"]
            teacher_candidate_counts[teacher_id] = teacher_candidate_counts.get(teacher_id, 0) + 1
        candidate_specs.sort(key=lambda item: item["cost"])
        candidate_specs = select_candidate_specs(candidate_specs, candidate_limit)

        for candidate_spec in candidate_specs:
            slot = candidate_spec["slot"]
            teacher_id = candidate_spec["teacherId"]
            var = model.NewBoolVar(f"x_{task_index}_{teacher_id}_{slot['date']}_{slot['period']}")
            candidate = {
                "taskIndex": task_index,
                "task": task,
                "teacherId": teacher_id,
                "slot": slot,
            }
            task_vars[task_index].append(var)
            candidates_by_var[var.Index()] = candidate
            teacher_slot_vars.setdefault((teacher_id, slot["slotKey"]), []).append(var)
            class_slot_vars.setdefault((task["classId"], slot["slotKey"]), []).append(var)
            room_slot_vars.setdefault((task["roomId"], slot["slotKey"]), []).append(var)
            class_subject_day_vars.setdefault((task["classId"], task["subjectId"], slot["date"]), []).append(var)
            class_subject_day_period_vars.setdefault(
                (task["classId"], task["subjectId"], slot["date"], int(slot["period"])),
                [],
            ).append(var)
            teacher_vars.setdefault(teacher_id, []).append(var)
            teacher_day_vars.setdefault((teacher_id, slot["date"]), []).append(var)
            teacher_day_period_vars.setdefault((teacher_id, slot["date"], int(slot["period"])), []).append(var)
            class_day_vars.setdefault((task["classId"], slot["date"]), []).append(var)
            objective_terms.append(int(round(candidate_spec["cost"] * 10)) * var)

        if not task_vars[task_index]:
            return {
                "ok": False,
                "error": "CP_SAT_INFEASIBLE",
                "message": f"{task['className']} {task['subjectName']} 没有可用老师/时段候选",
                "diagnostics": build_solver_diagnostics(
                    task_reports,
                    teacher_task_demand,
                    teacher_candidate_counts,
                    config,
                ),
            }
        model.Add(sum(task_vars[task_index]) == 1)

    for variables in teacher_slot_vars.values():
        model.Add(sum(variables) <= 1)
    for variables in class_slot_vars.values():
        model.Add(sum(variables) <= 1)
    for variables in room_slot_vars.values():
        model.Add(sum(variables) <= 1)
    for key, variables in class_subject_day_vars.items():
        locked_count = class_subject_day_locked.get(key, 0)
        subject = subjects_by_id.get(key[1], {})
        max_per_class_per_day = int(subject.get("maxPerClassPerDay") or 0)
        if max_per_class_per_day > 0:
            if locked_count > max_per_class_per_day:
                return {
                    "ok": False,
                    "error": "CP_SAT_INFEASIBLE",
                    "message": f"{key[0]} {key[2]} {subject.get('name') or key[1]} 已锁定课程超过每日上限",
                }
            model.Add(sum(variables) + locked_count <= max_per_class_per_day)

    teacher_load_vars = []
    max_load = model.NewIntVar(0, len(tasks) + len(locked_assignments) + len(external_assignments), "max_teacher_load")
    min_load = model.NewIntVar(0, len(tasks) + len(locked_assignments) + len(external_assignments), "min_teacher_load")
    for teacher in config.get("teachers") or []:
        teacher_id = teacher["id"]
        load = model.NewIntVar(0, len(tasks) + len(locked_assignments) + len(external_assignments), f"load_{teacher_id}")
        model.Add(load == sum(teacher_vars.get(teacher_id, [])) + teacher_fixed_load.get(teacher_id, 0))
        teacher_load_vars.append(load)
    if teacher_load_vars:
        model.AddMaxEquality(max_load, teacher_load_vars)
        model.AddMinEquality(min_load, teacher_load_vars)
        objective_terms.append((max_load - min_load) * 40)

    weekly_per_class = sum(int(subject.get("weeklyLessons") or 0) for subject in config.get("subjects") or [])
    target_class_day_load = int(math.ceil(weekly_per_class / 5)) if weekly_per_class else 0
    for key, variables in class_day_vars.items():
        load = model.NewIntVar(0, len(config.get("periods") or []), f"class_day_{key[0]}_{key[1]}")
        model.Add(load == sum(variables))
        diff = model.NewIntVar(0, len(config.get("periods") or []), f"class_day_diff_{key[0]}_{key[1]}")
        model.AddAbsEquality(diff, load - target_class_day_load)
        objective_terms.append(diff * 4)

    for key, variables in teacher_day_vars.items():
        load = model.NewIntVar(0, len(config.get("periods") or []), f"teacher_day_{key[0]}_{key[1]}")
        model.Add(load == sum(variables))
        rule = rules_by_teacher.get(key[0]) or {}
        max_daily_lessons = int(rule.get("maxDailyLessons") or 4)
        fixed_day_load = teacher_fixed_day_load.get(key, 0)
        if fixed_day_load > max_daily_lessons:
            return {
                "ok": False,
                "error": "CP_SAT_INFEASIBLE",
                "message": f"{key[0]} {key[1]} 已锁定/外部课量超过每日上限",
            }
        model.Add(load + fixed_day_load <= max_daily_lessons)
        excess = model.NewIntVar(0, len(config.get("periods") or []), f"teacher_day_excess_{key[0]}_{key[1]}")
        model.Add(excess >= load + fixed_day_load - max_daily_lessons)
        model.Add(excess >= 0)
        objective_terms.append(excess * 10)

    period_numbers = [int(period["period"]) for period in config.get("periods") or []]
    class_subject_day_keys = set(
        (class_id, subject_id, date)
        for class_id, subject_id, date, _period in class_subject_day_period_vars.keys()
    ) | set(class_subject_day_locked.keys())
    for class_id, subject_id, date in class_subject_day_keys:
        subject = subjects_by_id.get(subject_id, {})
        if subject.get("allowConsecutive", True) is not False:
            continue
        for index in range(0, len(period_numbers) - 1):
            window = period_numbers[index : index + 2]
            fixed_count = sum(
                class_subject_day_period_locked.get((class_id, subject_id, date, period), 0)
                for period in window
            )
            variables = []
            for period in window:
                variables.extend(class_subject_day_period_vars.get((class_id, subject_id, date, period), []))
            if fixed_count > 1:
                return {
                    "ok": False,
                    "error": "CP_SAT_INFEASIBLE",
                    "message": f"{class_id} {date} {subject.get('name') or subject_id} 已锁定课程违反不连堂规则",
                }
            if variables:
                model.Add(sum(variables) + fixed_count <= 1)

    teacher_day_keys = set(teacher_day_vars.keys()) | set(teacher_fixed_day_periods.keys())
    for teacher_id, date in teacher_day_keys:
        rule = rules_by_teacher.get(teacher_id) or {}
        max_consecutive_lessons = int(rule.get("maxConsecutiveLessons") or 3)
        if max_consecutive_lessons >= len(period_numbers):
            continue
        fixed_periods = teacher_fixed_day_periods.get((teacher_id, date), set())
        for start_index in range(0, len(period_numbers) - max_consecutive_lessons):
            window = period_numbers[start_index : start_index + max_consecutive_lessons + 1]
            fixed_count = sum(1 for period in window if period in fixed_periods)
            variables = []
            for period in window:
                variables.extend(teacher_day_period_vars.get((teacher_id, date, period), []))
            if fixed_count > max_consecutive_lessons:
                return {
                    "ok": False,
                    "error": "CP_SAT_INFEASIBLE",
                    "message": f"{teacher_id} {date} 已锁定/外部课表存在超过连续上限的连堂",
                }
            if variables:
                model.Add(sum(variables) + fixed_count <= max_consecutive_lessons)

    diagnostics = build_solver_diagnostics(task_reports, teacher_task_demand, teacher_candidate_counts, config)
    time_limit_seconds = float(options.get("timeLimitSeconds") or 10)
    workers = int(options.get("workers") or 8)
    two_stage = options.get("twoStage", True) is not False
    phase = "single_stage"
    phase1_status_name = ""
    phase2_status_name = ""
    phase1_time_seconds = 0
    phase2_time_seconds = 0
    status_name = "UNKNOWN"
    objective_value = 0
    best_objective_bound = 0
    branches = 0
    conflicts = 0

    if objective_terms and two_stage:
        phase1_limit = float(options.get("feasibilityTimeLimitSeconds") or min(max(time_limit_seconds * 0.35, 5), 20))
        phase1_limit = min(phase1_limit, max(time_limit_seconds - 1, 1))
        phase1_solver = configure_solver(cp_model, phase1_limit, workers)
        phase1_status = phase1_solver.Solve(model)
        phase1_status_name = phase1_solver.StatusName(phase1_status)
        phase1_time_seconds = phase1_solver.WallTime()

        if phase1_status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return {
                "ok": False,
                "error": "CP_SAT_NO_FEASIBLE_SOLUTION",
                "status": phase1_status_name,
                "phase": "feasibility",
                "phase1Status": phase1_status_name,
                "message": "CP-SAT 硬约束阶段未找到可行课表",
                "diagnostics": diagnostics,
                "wallTimeMs": round((time.time() - started) * 1000),
            }

        hint_count = 0
        for variables in task_vars.values():
            for variable in variables:
                model.AddHint(variable, 1 if phase1_solver.BooleanValue(variable) else 0)
                hint_count += 1

        model.Minimize(sum(objective_terms))
        phase2_limit = max(time_limit_seconds - phase1_time_seconds, 1)
        phase2_solver = configure_solver(cp_model, phase2_limit, workers)
        phase2_status = phase2_solver.Solve(model)
        phase2_status_name = phase2_solver.StatusName(phase2_status)
        phase2_time_seconds = phase2_solver.WallTime()

        if phase2_status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            solver = phase2_solver
            phase = "optimized"
            status_name = phase2_status_name
            objective_value = phase2_solver.ObjectiveValue()
            best_objective_bound = phase2_solver.BestObjectiveBound()
        else:
            solver = phase1_solver
            phase = "feasible_only"
            status_name = phase1_status_name
            diagnostics.append(
                solver_diagnostic(
                    "warning",
                    "cp_sat_optimization_not_finished",
                    "软约束优化未完成",
                    "硬约束已找到可行课表，但第二阶段未在时间限制内完成优化，当前返回第一阶段可行解。",
                    {"phase2Status": phase2_status_name, "hintCount": hint_count},
                )
            )
        branches = solver.NumBranches()
        conflicts = solver.NumConflicts()
    else:
        if objective_terms:
            model.Minimize(sum(objective_terms))
        solver = configure_solver(cp_model, time_limit_seconds, workers)
        status = solver.Solve(model)
        status_name = solver.StatusName(status)

        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return {
                "ok": False,
                "error": "CP_SAT_NO_SOLUTION",
                "status": status_name,
                "phase": "single_stage",
                "message": "CP-SAT 未在限制时间内找到可行课表",
                "diagnostics": diagnostics,
                "wallTimeMs": round((time.time() - started) * 1000),
            }
        if objective_terms:
            objective_value = solver.ObjectiveValue()
            best_objective_bound = solver.BestObjectiveBound()
        branches = solver.NumBranches()
        conflicts = solver.NumConflicts()

    assignments = list(locked_assignments)
    for var_index, candidate in candidates_by_var.items():
        var = model.GetBoolVarFromProtoIndex(var_index)
        if solver.BooleanValue(var):
            assignments.append(assignment_from_candidate(config, candidate["task"], candidate))

    assignments.sort(key=lambda item: f"{item.get('classId')} {item.get('date')} {item.get('period')}")
    return {
        "ok": True,
        "status": status_name,
        "phase": phase,
        "phase1Status": phase1_status_name,
        "phase2Status": phase2_status_name,
        "assignments": assignments,
        "objectiveValue": objective_value,
        "bestObjectiveBound": best_objective_bound,
        "solveTimeSeconds": round((time.time() - started), 4),
        "phase1SolveTimeSeconds": phase1_time_seconds,
        "phase2SolveTimeSeconds": phase2_time_seconds,
        "branches": branches,
        "conflicts": conflicts,
        "diagnostics": diagnostics,
        "wallTimeMs": round((time.time() - started) * 1000),
    }


def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        emit(solve(payload))
    except Exception as exc:
        emit(
            {
                "ok": False,
                "error": "CP_SAT_RUNTIME_ERROR",
                "message": str(exc),
            }
        )


if __name__ == "__main__":
    main()
