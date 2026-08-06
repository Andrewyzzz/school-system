// 通用审批（OA）引擎验证
// 覆盖：模板与角色过滤、表单必填与类型校验、业务规则、多级流转、会签或签、
//       拒绝、撤回、催办、越权、待办计数、查询范围、超时提醒
import assert from "node:assert/strict";
import {
  OA_TEMPLATES,
  ensureOaTemplates,
  listAllTemplates,
  createOaTemplate,
  updateOaTemplate,
  setOaTemplateStatus,
  deleteOaTemplate,
  listTemplatesForRole,
  createOaRequest,
  actOnOaRequest,
  withdrawOaRequest,
  urgeOaRequest,
  queryOaRequests,
  getOaRequestDetail,
  countOaTodos,
  scanOaTimeouts,
  findTemplate,
} from "../server/oa.js";

const account = (id, role, name) => ({ id, role, displayName: name, username: id });
const teacher = account("ACC-T1", "teacher", "张老师");
const teacher2 = account("ACC-T2", "teacher", "李老师");
const head = account("ACC-H1", "division_head", "小学部负责人");
const hr = account("ACC-HR", "hr", "人事专员");
const admin = account("ACC-AD", "admin", "教务");
const finance = account("ACC-FI", "finance", "财务");
const sysadmin = account("ACC-SA", "system_admin", "总校管理员");

function freshDb() {
  const db = { oaRequests: [], oaTemplates: [], notifications: [] };
  ensureOaTemplates(db);
  return db;
}

function leaveForm(overrides = {}) {
  return {
    leaveType: "事假",
    startDate: "2026-09-10",
    endDate: "2026-09-11",
    days: 2,
    reason: "家中有事",
    ...overrides,
  };
}

// ------------------------------------------------------------ 模板与角色过滤
{
  assert.ok(OA_TEMPLATES.length >= 7, "应内置至少 7 类审批模板");
  OA_TEMPLATES.forEach((template) => {
    assert.ok(template.key && template.name && template.icon, `模板 ${template.key} 字段不完整`);
    assert.ok(template.formFields.length > 0, `模板 ${template.key} 必须有表单字段`);
    assert.ok(template.steps.length > 0, `模板 ${template.key} 必须有审批步骤`);
    template.steps.forEach((step) => {
      assert.ok(step.approverRoles.length > 0, `模板 ${template.key} 的步骤必须指定审批角色`);
    });
  });

  const teacherTemplates = listTemplatesForRole(freshDb(), "teacher").map((item) => item.key);
  assert.ok(teacherTemplates.includes("leave"), "老师应能发起请假");
  assert.ok(teacherTemplates.includes("lesson_swap"), "老师应能发起调课");
  assert.ok(!teacherTemplates.includes("budget_confirm"), "老师不应能发起预算确认");
  assert.ok(!teacherTemplates.includes("class_size_confirm"), "老师不应能发起人数确认");

  const financeTemplates = listTemplatesForRole(freshDb(), "finance").map((item) => item.key);
  assert.ok(financeTemplates.includes("budget_confirm"), "财务应能发起预算确认");
  assert.ok(financeTemplates.includes("lesson_rule_confirm"), "财务应能发起课时规则确认");
}

// ---------------------------------------------------------------- 表单校验
{
  const db = freshDb();
  // 必填缺失
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: { leaveType: "事假" } }),
    /请填写/,
    "缺少必填项应报错",
  );
  // 选项非法
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm({ leaveType: "编造假种" }) }),
    /取值无效/,
    "非法选项应报错",
  );
  // 数字类型
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm({ days: "不是数字" }) }),
    /必须是数字/,
    "数字字段应校验",
  );
  // 业务规则：结束早于开始
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm({ startDate: "2026-09-20", endDate: "2026-09-10" }) }),
    /结束日期不能早于开始日期/,
  );
  // 业务规则：天数必须为正
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm({ days: 0 }) }),
    /请假天数必须大于 0/,
  );
  // 业务规则：预算比例之和必须为 100
  assert.throws(
    () =>
      createOaRequest(db, finance, {
        templateKey: "budget_confirm",
        formData: {
          termName: "2026学年第一学期",
          totalBudget: 1000000,
          payoutRatio: 90,
          reserveRatio: 20,
          breakdown: "小学部,300000",
          reason: "测试",
        },
      }),
    /之和应为 100%/,
  );
  assert.equal(db.oaRequests.length, 0, "校验失败不应产生审批单");
}

// -------------------------------------------------------------- 越权发起
{
  const db = freshDb();
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "budget_confirm", formData: {} }),
    /当前角色无法发起/,
    "老师不能发起预算确认",
  );
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "not_exist", formData: {} }),
    /审批类型无效/,
  );
}

// ------------------------------------------------------ 请假两级流转全链路
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  assert.equal(request.status, "pending");
  assert.equal(request.steps.length, 2, "请假为两级审批");
  assert.equal(request.steps[0].status, "pending");
  assert.equal(request.steps[1].status, "waiting");
  assert.equal(request.summary, "事假 2 天（2026-09-10 至 2026-09-11）", "摘要应可读");
  assert.equal(request.timeline.length, 1);
  assert.ok(db.notifications.length > 0, "应通知当前审批人");

  // 待办归属
  assert.equal(countOaTodos(db, head), 1, "学部负责人应有 1 条待办");
  assert.equal(countOaTodos(db, hr), 0, "第二级审批人此时不应有待办");
  assert.equal(countOaTodos(db, teacher), 0, "申请人自己没有待办");

  // 非当前环节审批人不能操作
  assert.throws(() => actOnOaRequest(db, request.id, "approve", hr, {}), /当前环节不由您处理/);
  assert.throws(() => actOnOaRequest(db, request.id, "approve", finance, {}), /当前环节不由您处理/);

  // 第一级通过
  actOnOaRequest(db, request.id, "approve", head, { comment: "同意", approverData: { substituteArrangement: "王老师代课" } });
  assert.equal(request.steps[0].status, "approved");
  assert.equal(request.currentStepIndex, 1);
  assert.equal(request.steps[1].status, "pending");
  assert.equal(request.status, "pending");
  assert.equal(countOaTodos(db, hr), 1, "应流转到人事待办");
  assert.equal(countOaTodos(db, head), 0, "上一级不再有待办");

  // 第二级通过 → 完成
  actOnOaRequest(db, request.id, "approve", hr, { comment: "已备案" });
  assert.equal(request.status, "approved");
  assert.ok(request.completedAt, "完成时应记录时间");
  assert.equal(countOaTodos(db, hr), 0);
  assert.ok(
    request.timeline.some((item) => item.action === "completed"),
    "时间线应有完成记录",
  );
  // 已结束不能再操作
  assert.throws(() => actOnOaRequest(db, request.id, "approve", hr, {}), /已通过/);
}

// -------------------------------------------------------------------- 拒绝
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 拒绝必须填理由
  assert.throws(() => actOnOaRequest(db, request.id, "reject", head, { comment: "" }), /必须填写理由/);

  actOnOaRequest(db, request.id, "reject", head, { comment: "本周课程无法安排代课" });
  assert.equal(request.status, "rejected");
  assert.equal(request.steps[0].status, "rejected");
  assert.equal(request.steps[1].status, "waiting", "被拒后后续环节不再推进");
  assert.equal(countOaTodos(db, hr), 0);
  assert.ok(
    db.notifications.some((item) => item.accountIds.includes(teacher.id) && item.level === "danger"),
    "应通知申请人被拒",
  );
}

// -------------------------------------------------------------------- 撤回
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 他人不能撤回
  assert.throws(() => withdrawOaRequest(db, request.id, teacher2), /只能撤回本人发起的申请/);
  withdrawOaRequest(db, request.id, teacher);
  assert.equal(request.status, "withdrawn");
  assert.equal(countOaTodos(db, head), 0, "撤回后审批人待办应清空");
  // 已结束不能再撤回
  assert.throws(() => withdrawOaRequest(db, request.id, teacher), /无法撤回/);
}

// -------------------------------------------------------------------- 催办
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  const before = db.notifications.length;
  assert.throws(() => urgeOaRequest(db, request.id, teacher2), /只能催办本人发起的申请/);
  urgeOaRequest(db, request.id, teacher);
  assert.ok(db.notifications.length > before, "催办应产生新通知");
  assert.ok(request.timeline.some((item) => item.action === "urged"));
}

// ------------------------------------------------------------ 单级流程与或签
{
  const db = freshDb();
  // 调课：单级教务审批
  const request = createOaRequest(db, teacher, {
    templateKey: "lesson_swap",
    formData: {
      lessonDate: "2026-09-15",
      lessonInfo: "高一(1)班 数学 第3节",
      swapType: "他人代课",
      reason: "外出培训",
    },
  });
  assert.equal(request.steps.length, 1);
  // 具体安排由教务在审批时指定
  assert.throws(
    () => actOnOaRequest(db, request.id, "approve", admin, { comment: "已安排" }),
    /请填写「调课安排」/,
    "未填调课安排应被拦截",
  );
  actOnOaRequest(db, request.id, "approve", admin, {
    comment: "已安排",
    approverData: { arrangement: "改由王老师代课" },
  });
  assert.equal(request.steps[0].approverData.arrangement, "改由王老师代课", "安排应留痕");
  assert.equal(request.status, "approved", "单级审批通过即完成");

  // 或签：加班审批多角色任一处理即可
  const overtime = createOaRequest(db, teacher, {
    templateKey: "overtime",
    formData: {
      overtimeDate: "2026-09-20",
      startTime: "18:00",
      endTime: "21:00",
      hours: 3,
      overtimeType: "周末加班",
      reason: "监考",
    },
  });
  assert.equal(countOaTodos(db, head), 1);
  assert.equal(countOaTodos(db, admin), 1, "或签下多个角色都能看到待办");
  actOnOaRequest(db, overtime.id, "approve", admin, { comment: "确认" });
  assert.equal(overtime.status, "approved", "或签一人通过即完成");
  assert.equal(countOaTodos(db, head), 0, "完成后其他人待办清空");
}

// ------------------------------------------------------ 三级流程（人数确认）
{
  const db = freshDb();
  const request = createOaRequest(db, admin, {
    templateKey: "class_size_confirm",
    formData: {
      termName: "2026学年第一学期",
      effectiveMonth: "2026-09",
      scopeInfo: "小学部全部班级",
      classDetail: "一年级1班,45\n一年级2班,44",
      reason: "学期初核定",
    },
  });
  assert.equal(request.steps.length, 3, "人数确认为三级审批");
  actOnOaRequest(db, request.id, "approve", head, { comment: "核对无误" });
  assert.equal(request.currentStepIndex, 1);
  actOnOaRequest(db, request.id, "approve", finance, { comment: "财务确认" });
  assert.equal(request.currentStepIndex, 2);
  assert.equal(request.status, "pending");
  actOnOaRequest(db, request.id, "approve", sysadmin, { comment: "同意" });
  assert.equal(request.status, "approved", "三级全部通过后完成");
  assert.equal(request.timeline.filter((item) => item.action === "approved").length, 3);
}

// ------------------------------------------------------------------ 查询范围
{
  const db = freshDb();
  const own = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  createOaRequest(db, teacher2, { templateKey: "leave", formData: leaveForm({ reason: "另一位老师" }) });

  const todo = queryOaRequests(db, { scope: "todo" }, head);
  assert.equal(todo.meta.total, 2, "学部负责人待办应含两条");
  assert.ok(todo.items.every((item) => item.canAct), "待办项应标记可操作");

  const mine = queryOaRequests(db, { scope: "mine" }, teacher);
  assert.equal(mine.meta.total, 1, "我发起的只含本人");
  assert.ok(mine.items[0].canWithdraw, "本人待审批的可撤回");

  // 老师查看 todo 范围时看不到别人的单子
  const teacherTodo = queryOaRequests(db, { scope: "todo" }, teacher);
  assert.equal(teacherTodo.meta.total, 0);

  // 我处理过
  actOnOaRequest(db, own.id, "approve", head, { comment: "同意", approverData: { substituteArrangement: "王老师代课" } });
  const handled = queryOaRequests(db, { scope: "handled" }, head);
  assert.equal(handled.meta.total, 1, "处理过的应可追溯");

  // 状态过滤与搜索（搜索命中申请人姓名或事项摘要）
  assert.equal(queryOaRequests(db, { scope: "all", status: "pending" }, sysadmin).meta.total, 2);
  assert.equal(queryOaRequests(db, { scope: "all", search: "李老师" }, sysadmin).meta.total, 1, "应能按申请人搜索");
  assert.equal(queryOaRequests(db, { scope: "all", search: "事假" }, sysadmin).meta.total, 2, "应能按摘要搜索");
  assert.equal(queryOaRequests(db, { scope: "all", search: "不存在的关键词" }, sysadmin).meta.total, 0);
}

// ------------------------------------------------------------ 详情权限控制
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 申请人可看
  assert.ok(getOaRequestDetail(db, request.id, teacher).id);
  // 审批链上的角色可看
  assert.ok(getOaRequestDetail(db, request.id, head).id);
  assert.ok(getOaRequestDetail(db, request.id, hr).id);
  // 无关老师看不到
  assert.throws(() => getOaRequestDetail(db, request.id, teacher2), /无权查看/);
  // 详情应带表单字段定义，供前端渲染
  const detail = getOaRequestDetail(db, request.id, head);
  assert.ok(detail.formFields.length > 0);
  assert.equal(detail.canAct, true);
  assert.equal(getOaRequestDetail(db, request.id, teacher).canWithdraw, true);
}

// -------------------------------------------------------------- 超时提醒
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 刚提交不提醒
  assert.equal(scanOaTimeouts(db).reminded, 0);
  // 回拨时间超过阈值
  const old = new Date(Date.now() - 5 * 86400000).toISOString();
  request.createdAt = old;
  request.updatedAt = old;
  assert.equal(scanOaTimeouts(db).reminded, 1, "超期应提醒一次");
  assert.equal(scanOaTimeouts(db).reminded, 0, "同一周期内不重复提醒");
  // 已完成的不再提醒
  actOnOaRequest(db, request.id, "approve", head, { approverData: { substituteArrangement: "王老师代课" } });
  actOnOaRequest(db, request.id, "approve", hr, {});
  assert.equal(scanOaTimeouts(db).reminded, 0);
}

// -------------------------------------------------- 重复投票与模板查找
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  actOnOaRequest(db, request.id, "approve", head, { comment: "同意", approverData: { substituteArrangement: "王老师代课" } });
  // 同一人不能在同一环节重复处理（此时已流转到下一环节，故报环节不符）
  assert.throws(() => actOnOaRequest(db, request.id, "approve", head, {}), /当前环节不由您处理/);
  assert.equal(findTemplate(db, "leave").name, "请假申请");
  assert.equal(findTemplate(db, "not_exist"), null);
}

// ---------------------------------------- 代课与工作交接由上级在审批时安排
{
  const db = freshDb();
  const leaveTemplate = findTemplate(db, "leave");
  assert.ok(
    !leaveTemplate.formFields.some((field) => field.key === "handover"),
    "请假表单不应再要求申请人填写交接人",
  );
  const arrangeFields = leaveTemplate.steps[0].approverFields || [];
  assert.ok(
    arrangeFields.some((field) => field.key === "substituteArrangement" && field.required),
    "学部负责人环节应必填代课安排",
  );

  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 未安排代课不能通过
  assert.throws(
    () => actOnOaRequest(db, request.id, "approve", head, { comment: "同意" }),
    /请填写「代课安排」/,
  );
  actOnOaRequest(db, request.id, "approve", head, {
    comment: "同意",
    approverData: { substituteArrangement: "由王芳老师代课", handoverNote: "晨检交副班主任" },
  });
  assert.equal(request.steps[0].approverData.substituteArrangement, "由王芳老师代课");
  assert.equal(request.steps[0].approverData.handoverNote, "晨检交副班主任");

  // 申请人可在详情中看到上级的安排
  const detail = getOaRequestDetail(db, request.id, teacher);
  assert.equal(detail.steps[0].approverData.substituteArrangement, "由王芳老师代课", "申请人应能看到代课安排");
  // 当前环节（人事备案）无需填写内容
  assert.equal(detail.currentApproverFields.length, 0);
}

// ------------------------------------------- 审批流程自定义（系统管理员 DIY）
{
  const db = freshDb();
  const before = listAllTemplates(db).length;

  // 新建自定义模板
  const created = createOaTemplate(
    db,
    {
      key: "seal_use",
      name: "用章申请",
      icon: "🔖",
      category: "行政",
      description: "公章使用申请",
      applicantRoles: ["teacher", "admin"],
      formFields: [
        { key: "sealType", label: "印章类型", type: "select", required: true, options: ["公章", "合同章"] },
        { key: "purpose", label: "用途", type: "textarea", required: true },
      ],
      steps: [
        { name: "部门负责人审批", approverRoles: ["division_head", "admin"], approverMode: "any" },
        {
          name: "办公室登记",
          approverRoles: ["hr"],
          approverMode: "any",
          approverFields: [{ key: "sealNo", label: "用印编号", type: "text", required: true }],
        },
      ],
    },
    sysadmin,
  );
  assert.equal(created.builtIn, false, "自定义模板不应标记为内置");
  assert.equal(listAllTemplates(db).length, before + 1);
  assert.ok(
    listTemplatesForRole(db, "teacher").some((item) => item.key === "seal_use"),
    "新模板应立即对可发起角色可见",
  );

  // 用自定义模板走完流程，验证审批人填写项生效
  const request = createOaRequest(db, teacher, {
    templateKey: "seal_use",
    formData: { sealType: "公章", purpose: "开具证明" },
  });
  actOnOaRequest(db, request.id, "approve", admin, { comment: "同意" });
  assert.throws(() => actOnOaRequest(db, request.id, "approve", hr, {}), /请填写「用印编号」/);
  actOnOaRequest(db, request.id, "approve", hr, { approverData: { sealNo: "YZ-2026-001" } });
  assert.equal(request.status, "approved");
  assert.equal(request.steps[1].approverData.sealNo, "YZ-2026-001");

  // 校验：标识非法、角色非法、选择类型缺选项、环节缺角色
  assert.throws(() => createOaTemplate(db, { key: "Bad Key", name: "x" }, sysadmin), /模板标识只能用/);
  // 标识重复（补齐其它必填项，确保命中的是重复校验而非缺字段）
  assert.throws(
    () =>
      createOaTemplate(
        db,
        {
          key: "seal_use",
          name: "重复的用章申请",
          applicantRoles: ["teacher"],
          formFields: [{ key: "a", label: "甲", type: "text" }],
          steps: [{ name: "审批", approverRoles: ["admin"] }],
        },
        sysadmin,
      ),
    /模板标识已存在/,
  );
  assert.throws(
    () =>
      createOaTemplate(
        db,
        {
          key: "bad_role",
          name: "测试",
          applicantRoles: ["teacher"],
          formFields: [{ key: "a", label: "甲", type: "text" }],
          steps: [{ name: "审批", approverRoles: ["不存在"] }],
        },
        sysadmin,
      ),
    /包含无效角色/,
  );
  assert.throws(
    () =>
      createOaTemplate(
        db,
        {
          key: "bad_option",
          name: "测试",
          applicantRoles: ["teacher"],
          formFields: [{ key: "a", label: "甲", type: "select" }],
          steps: [{ name: "审批", approverRoles: ["admin"] }],
        },
        sysadmin,
      ),
    /必须配置选项/,
  );

  // 修改内置模板的审批链
  const updated = updateOaTemplate(
    db,
    "attendance_fix",
    {
      name: "补卡申请",
      icon: "⏱️",
      category: "考勤",
      description: "考勤补记",
      applicantRoles: ["teacher"],
      formFields: [{ key: "fixDate", label: "补卡日期", type: "date", required: true }],
      steps: [
        { name: "部门负责人审批", approverRoles: ["division_head"], approverMode: "any" },
        { name: "人事复核", approverRoles: ["hr"], approverMode: "any" },
      ],
    },
    sysadmin,
  );
  assert.equal(updated.steps.length, 2, "内置模板的审批链应可改为两级");
  assert.equal(updated.updatedByName, "总校管理员", "应记录修改人");
  const newFix = createOaRequest(db, teacher, { templateKey: "attendance_fix", formData: { fixDate: "2026-09-10" } });
  assert.equal(newFix.steps.length, 2, "新申请应按修改后的流程走");

  // 停用后不可发起，启用后恢复
  setOaTemplateStatus(db, "seal_use", "disabled", sysadmin);
  assert.ok(!listTemplatesForRole(db, "teacher").some((item) => item.key === "seal_use"), "停用后不再出现在可发起列表");
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "seal_use", formData: { sealType: "公章", purpose: "x" } }),
    /已停用/,
  );
  setOaTemplateStatus(db, "seal_use", "active", sysadmin);
  assert.ok(listTemplatesForRole(db, "teacher").some((item) => item.key === "seal_use"));

  // 内置模板不可删除；有进行中单据的模板不可删除
  assert.throws(() => deleteOaTemplate(db, "leave"), /内置模板不可删除/);
  const pendingSeal = createOaRequest(db, teacher, {
    templateKey: "seal_use",
    formData: { sealType: "公章", purpose: "占用中" },
  });
  assert.throws(() => deleteOaTemplate(db, "seal_use"), /仍有审批中的单据/);
  withdrawOaRequest(db, pendingSeal.id, teacher);
  assert.deepEqual(deleteOaTemplate(db, "seal_use"), { deleted: true });
}

// -------------------------------------------------- 播种幂等性与配置保留
{
  const db = freshDb();
  // 学校改过的流程在再次播种时不应被重置
  updateOaTemplate(
    db,
    "overtime",
    {
      name: "加班申请",
      icon: "🌙",
      category: "考勤",
      description: "自定义后的说明",
      applicantRoles: ["teacher"],
      formFields: [{ key: "hours", label: "时长", type: "number", required: true }],
      steps: [{ name: "自定义环节", approverRoles: ["hr"], approverMode: "any" }],
    },
    sysadmin,
  );
  const changed = ensureOaTemplates(db);
  assert.equal(changed, false, "已有模板齐全时不应再写入");
  const overtime = findTemplate(db, "overtime");
  assert.equal(overtime.steps[0].name, "自定义环节", "自定义流程不应被播种覆盖");
  assert.equal(overtime.description, "自定义后的说明");
}

console.log("oa flows checks passed");
