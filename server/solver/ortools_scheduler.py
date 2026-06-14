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

    for task_index, task in enumerate(tasks):
        task_vars[task_index] = []
        candidate_specs = []
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

        candidate_specs.sort(key=lambda item: item["cost"])
        if len(candidate_specs) > candidate_limit:
            candidate_specs = candidate_specs[:candidate_limit]

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

    if objective_terms:
        model.Minimize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(options.get("timeLimitSeconds") or 10)
    solver.parameters.num_search_workers = int(options.get("workers") or 8)
    status = solver.Solve(model)
    status_name = solver.StatusName(status)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {
            "ok": False,
            "error": "CP_SAT_NO_SOLUTION",
            "status": status_name,
            "message": "CP-SAT 未在限制时间内找到可行课表",
            "wallTimeMs": round((time.time() - started) * 1000),
        }

    assignments = list(locked_assignments)
    for var_index, candidate in candidates_by_var.items():
        var = model.GetBoolVarFromProtoIndex(var_index)
        if solver.BooleanValue(var):
            assignments.append(assignment_from_candidate(config, candidate["task"], candidate))

    assignments.sort(key=lambda item: f"{item.get('classId')} {item.get('date')} {item.get('period')}")
    return {
        "ok": True,
        "status": status_name,
        "assignments": assignments,
        "objectiveValue": solver.ObjectiveValue() if objective_terms else 0,
        "bestObjectiveBound": solver.BestObjectiveBound() if objective_terms else 0,
        "solveTimeSeconds": solver.WallTime(),
        "branches": solver.NumBranches(),
        "conflicts": solver.NumConflicts(),
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
