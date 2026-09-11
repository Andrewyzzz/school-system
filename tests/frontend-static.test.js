// 前端静态检查
//
// app.js 有一万七千行、没有构建步骤、没有类型检查，而 `node --check` 只验语法。
// 于是有一整类错误能一路滑到浏览器里才炸，并且炸的时候整个视图空白：
//
//   1. 引用了不存在的变量。改名时改了引用没改声明，语法完全合法。
//      本次真实案例：`${payableCount}`，而声明还叫 completedCount，
//      「我的课表」整页空白。
//   2. 模块级 let 声明在首次渲染之后。函数声明会提升，let 不会，
//      渲染跑到时变量还在暂时性死区。
//      本次真实案例：ledgerState / monitoringState 写在文件末尾，
//      账套管理和系统监控两个页面都打不开。
//
// 两类都不会让测试变红——因为测试根本不执行 app.js（它要 DOM）。
// 这个文件用文本分析来兜住它们。判据宁可保守：误报会逼人去改本来正确的代码。
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf-8");
const lines = app.split("\n");

// ---------------------------------------------------------------------------
// 1. 模板串里引用的变量，文件里要真的声明过
//
// 只查 ${bareIdentifier} 这种最简单的形式：带点号、带调用、带下标的都跳过，
// 那些要真正解析作用域才能判断，猜错了就是误报。
// ---------------------------------------------------------------------------
{
  // 收集所有声明过的名字：const/let/var、function、class、函数参数、解构
  const declared = new Set();
  for (const m of app.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  for (const m of app.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  for (const m of app.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  // 解构：const { a, b: c } = ... / const [x, y] = ...
  for (const m of app.matchAll(/\b(?:const|let|var)\s*[{[]([^}\]]{0,300})[}\]]/g)) {
    for (const part of m[1].split(",")) {
      const name = part.includes(":") ? part.split(":")[1] : part;
      const clean = name.replace(/[.=].*$/s, "").trim();
      if (/^[A-Za-z_$][\w$]*$/.test(clean)) declared.add(clean);
    }
  }
  // 函数参数：(a, b = 1, {c}) => 和 function f(a, b)
  for (const m of app.matchAll(/(?:function\s*[\w$]*\s*|\)\s*=>|\()\s*\(?([^)]{0,300})\)\s*(?:=>|\{)/g)) {
    for (const part of m[1].split(",")) {
      const clean = part.replace(/[=:].*$/s, "").replace(/[{}[\].]/g, "").trim();
      if (/^[A-Za-z_$][\w$]*$/.test(clean)) declared.add(clean);
    }
  }
  // catch (error)、for (const x of ...) 已被上面覆盖
  for (const m of app.matchAll(/catch\s*\(\s*([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);

  // 浏览器与语言内置
  const GLOBALS = new Set([
    "window", "document", "console", "location", "navigator", "history", "localStorage", "sessionStorage",
    "fetch", "URL", "URLSearchParams", "Blob", "FormData", "FileReader", "AbortController", "AbortSignal",
    "EventSource", "WebSocket", "Image", "Audio", "Event", "CustomEvent", "MutationObserver", "IntersectionObserver",
    "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "queueMicrotask",
    "Math", "JSON", "Date", "Number", "String", "Boolean", "Array", "Object", "Set", "Map", "WeakMap", "WeakSet",
    "Promise", "Symbol", "RegExp", "Error", "TypeError", "RangeError", "Intl", "BigInt", "Proxy", "Reflect",
    "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent", "structuredClone",
    "undefined", "NaN", "Infinity", "globalThis", "crypto", "performance", "alert", "confirm", "prompt",
    "HTMLAnchorElement", "HTMLElement", "Node", "NodeList", "DOMParser", "TextDecoder", "TextEncoder",
    "this", "arguments", "true", "false", "null", "async", "await", "typeof", "new", "of", "in",
  ]);

  const missing = new Map();
  lines.forEach((line, index) => {
    for (const m of line.matchAll(/\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g)) {
      const name = m[1];
      if (declared.has(name) || GLOBALS.has(name)) continue;
      if (!missing.has(name)) missing.set(name, index + 1);
    }
  });

  assert.deepEqual(
    [...missing].map(([name, line]) => `${name}（app.js:${line}）`),
    [],
    "模板串引用了文件里没有声明的变量——浏览器里会抛 ReferenceError，整个视图空白",
  );
}

// ---------------------------------------------------------------------------
// 2. addEventListener 直接引用的处理函数必须存在
//
// 浏览器会在绑定到第一个不存在的函数时终止整个脚本，后面的所有交互监听都失效。
// ---------------------------------------------------------------------------
{
  const declaredFunctions = new Set(
    [...app.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]),
  );
  for (const match of app.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)) {
    declaredFunctions.add(match[1]);
  }
  const directHandlers = [
    ...app.matchAll(/\.addEventListener\(\s*["'][^"']+["']\s*,\s*([A-Za-z_$][\w$]*)\s*\)/g),
  ].map((match) => match[1]);
  const missingHandlers = [...new Set(directHandlers.filter((name) => !declaredFunctions.has(name)))];
  assert.deepEqual(
    missingHandlers,
    [],
    "事件监听绑定了不存在的处理函数——浏览器会在初始化中途抛 ReferenceError",
  );
}

// ---------------------------------------------------------------------------
// 3. 渲染函数用到的模块级状态，必须声明在顶层 render() 之前
//
// 函数声明会提升，所以渲染函数写在文件末尾没问题；但它读的 let 状态不会提升。
// app.js 末尾有一句顶格的 render() 作为启动入口——写在它**之后**的模块级 let，
// 首次渲染跑到时还在暂时性死区。
//
// 判据必须是「早于那句 render()」，不是「早于 renderStep 注册」：注册发生在
// render() 函数体内，而函数体要等被调用才执行，所以现有大量状态声明在注册行
// 之后照样正常。用错判据会把一整批正常代码标红，然后没人再信这个检查。
// ---------------------------------------------------------------------------
{
  const bootLine = lines.findIndex((l) => /^render\(\);/.test(l));
  assert.ok(bootLine > 0, "应能找到顶层的 render() 启动调用");

  const rendered = [...app.matchAll(/renderStep\("[^"]+",\s*([\w$]+)\)/g)].map((m) => m[1]);
  assert.ok(rendered.length > 10, `应能解析出渲染函数，实际 ${rendered.length} 个`);

  // 顶格的模块级状态声明及其行号（缩进的是函数内部局部变量，不受影响）
  const topLevelState = new Map();
  lines.forEach((line, index) => {
    const m = line.match(/^(?:let|const)\s+([A-Za-z_$][\w$]*)\s*=/);
    if (m) topLevelState.set(m[1], index + 1);
  });

  const late = [];
  rendered.forEach((fnName) => {
    const start = app.indexOf(`function ${fnName}(`);
    if (start < 0) return;
    const rest = app.slice(start);
    const end = rest.indexOf("\nfunction ", 1);
    const body = end > 0 ? rest.slice(0, end) : rest;
    for (const [name, declLine] of topLevelState) {
      if (declLine <= bootLine) continue;
      if (new RegExp(`\\b${name}\\b`).test(body)) {
        late.push(`${fnName} 读 ${name}（声明在 app.js:${declLine}，启动 render() 在 app.js:${bootLine + 1}）`);
      }
    }
  });

  assert.deepEqual(
    [...new Set(late)],
    [],
    "这些模块级状态声明在启动 render() 之后——let 不提升，首次渲染会抛 " +
      "「Cannot access X before initialization」，对应页面整片空白",
  );
}

// ---------------------------------------------------------------------------
// 4. 视图注册表、导航、渲染函数三者要对得上
//
// 少一环就是「菜单点进去空白」，而且不报错。
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const navViews = [...html.matchAll(/data-view="(\w+)"/g)].map((m) => m[1]);
  const registryViews = [...app.matchAll(/^\s{2}(\w+):\s*\{\s*\n\s*role:/gm)].map((m) => m[1]);

  const missingPanel = navViews.filter((v) => !html.includes(`id="${v}View"`));
  assert.deepEqual(missingPanel, [], "这些菜单没有对应的视图容器，点进去是空白");

  const missingRegistry = navViews.filter((v) => !registryViews.includes(v));
  assert.deepEqual(missingRegistry, [], "这些菜单不在 views 注册表里，切不过去");

  assert.match(
    html,
    /data-view="hrAudit" data-role="system_admin"/,
    "人事审计仅应对总校人事行政账号开放",
  );
  assert.match(
    app,
    /hrAudit:\s*\{\s*role: "system_admin"/,
    "人事审计视图注册表权限应与导航一致",
  );
}

// ---------------------------------------------------------------------------
// 5. 演示老师快捷登录：页面提示和键盘处理必须同时存在
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  assert.match(
    html,
    /data-demo-login="teacher_primary"[\s\S]{0,180}aria-keyshortcuts="Alt\+T"/,
    "老师账号按钮应声明 Alt+T 快捷键",
  );
  assert.match(app, /event\.altKey[\s\S]{0,180}event\.code !== "KeyT"/, "应监听 Alt\/Option + T");
  assert.match(app, /quickLoginDemo\("teacher_primary"\)/, "快捷键应登录演示老师账号");
  assert.match(
    app,
    /username === "finance"[\s\S]{0,250}fy260907-0019[\s\S]{0,250}本人当前密码/,
    "总校财务接管后快捷入口只能填正式用户名，不能再用旧 Demo 凭据假登录",
  );
  assert.doesNotMatch(
    app,
    /const demoAccepted = authenticateDemo\(/,
    "服务端拒绝登录后不得静默切回浏览器 Demo 数据",
  );
  assert.doesNotMatch(
    app,
    /\^\(10\\\.\|192\\\.168\\\.|172\\\./,
    "校内私有网段不能被判定为本地开发，否则会暴露 Demo 快捷账号和重置按钮",
  );
}

// ---------------------------------------------------------------------------
// 6. 老师端收敛：课时任务页隐藏，正常课次不显示「未到时间」标签
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  assert.doesNotMatch(html, /data-view="tasks"/, "老师侧边栏不应再显示课时任务入口");
  assert.doesNotMatch(html, /data-view-jump="tasks"/, "工作台不应保留课时任务跳转入口");
  assert.match(html, /id="tasksView"[^>]*hidden/, "课时任务页面应保持隐藏");
  assert.match(html, /aria-labelledby="todayTasksTitle" hidden/, "工作台今日课时任务表应隐藏");
  assert.doesNotMatch(app, /tasks:\s*\{\s*role:\s*"teacher"/, "隐藏页面不应继续注册为可访问视图");
  assert.match(
    app,
    /lesson\.status === "cancelled" \? statusTag\(lesson\.status\) : ""/,
    "老师课表只应给已取消课次显示状态标签",
  );
}

// ---------------------------------------------------------------------------
// 7. 请假半天计算与证明材料上传
// ---------------------------------------------------------------------------
{
  assert.match(app, /function leavePeriodCalculation\(/, "请假弹层应自动计算半天天数");
  assert.match(
    app,
    /onChange:\s*hasHalfDayRange\s*\?\s*\(\{ root, event \}\) => \{\s*syncLeaveDuration\(root, event\);/s,
    "请假及外出表单变化时应刷新时段计算",
  );
  assert.match(app, /multipart\.append\("payload"/, "有证明材料时应使用 multipart 上传");
  assert.match(app, /field\.type === "file"/, "通用弹层应支持文件字段");
  assert.match(app, /data-oa-attachment-id/, "审批详情应提供证明材料下载入口");
}

// ---------------------------------------------------------------------------
// 8. 老师端不再显示独立“我的课时”页面
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  assert.doesNotMatch(html, /data-view="records"/, "老师侧边栏不应显示“我的课时”入口");
  assert.match(html, /id="recordsView"[^>]*hidden/, "遗留的我的课时页面容器应保持隐藏");
  assert.doesNotMatch(app, /^\s{2}records:\s*\{/m, "隐藏页面不应继续注册为可访问视图");
  assert.doesNotMatch(app, /renderStep\("我的课时",\s*renderRecords\)/, "隐藏页面不应继续参与渲染");
}

// ---------------------------------------------------------------------------
// 9. 工资确认单栏、月份筛选与未发布隐私
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  const confirmStart = html.indexOf('<section class="view" id="confirmView"');
  const confirmEnd = html.indexOf('<section class="view" id="financeView"', confirmStart);
  const confirmMarkup = html.slice(confirmStart, confirmEnd);
  assert.equal((confirmMarkup.match(/<section class="panel/g) || []).length, 1, "工资确认页只应保留一个主面板");
  assert.match(confirmMarkup, /id="teacherPayrollMonthSelect"/, "工资确认页应提供当前学期月份下拉筛选");
  assert.match(app, /<option value="\$\{escapeHtml\(month\)\}">\$\{escapeHtml\(formatMonthLabel\(month\)\)\}<\/option>/, "下拉选项应显示具体年月");
  assert.match(app, /select\.onchange = handleSelection/, "月份下拉切换后应立即刷新工资确认单");
  assert.match(app, /function teacherPayrollTermMonths\(/, "老师工资月份应取自当前学期起止日期");
  assert.match(app, /eventStream\.addEventListener\("term"/, "切换当前学期后老师界面应自动刷新");
  assert.match(
    confirmMarkup,
    /财务尚未生成本月工资明细。生成后这里会展示完整工资确认单。/,
    "本月未生成时应显示约定空态",
  );
  assert.match(app, /function selectedTeacherConfirmationMonth\(/, "工资确认请求应跟随所选月份");
  assert.match(app, /confirmNet\.textContent = "—"/, "切回未生成月份时应清掉旧工资金额");
  assert.match(
    server,
    /if \(!\["generated", "teacher_confirmed", "disputed", "reviewed", "locked"\]\.includes\(status\)\) return null/,
    "服务端不得向老师返回未发布工资试算",
  );
  assert.match(server, /requireTeacherPayrollMonth\(res, db, auth\.account, month\)/, "老师工资接口应限制为当前学期");
  assert.match(server, /broadcastEvent\("term"\)/, "学期配置变化应推送给在线老师");
}

// ---------------------------------------------------------------------------
// 10. 审批类型必须用可视化配置器，不能要求行政手写 JSON
// ---------------------------------------------------------------------------
{
  const css = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  assert.doesNotMatch(app, /流程定义（JSON）/, "新建或编辑审批类型不应再出现 JSON 文本框");
  assert.match(app, /function openApprovalTemplateBuilder\(/, "应有统一的新建/编辑可视化配置器");
  assert.match(app, /data-builder-applicant-role/, "应通过勾选项配置可发起角色");
  assert.match(app, /data-builder-add-field/, "应能用按钮添加申请字段");
  assert.match(app, /data-builder-field-type/, "申请字段类型应使用下拉选择");
  assert.match(app, /data-builder-add-step/, "应能用按钮添加审批环节");
  assert.match(app, /data-builder-step-account/, "审批人应使用具体账号勾选项");
  assert.match(app, /data-builder-approver-search/, "审批人选择器应支持按姓名、部门或岗位搜索");
  assert.match(app, /匹配到 \$\{matched\}/, "搜索后应反馈匹配到的审批人人数");
  assert.match(css, /\.approval-builder-person\[hidden\] \{ display: none !important; \}/, "筛选后未匹配人员应真正隐藏");
  assert.match(app, /data-builder-step-mode/, "多人审批方式应使用下拉选择");
  assert.match(app, /APPROVAL_BUILDER_APPROVER_ROLE_FALLBACK/, "角色接口未加载时仍应展示可选审批角色");
  assert.match(app, /选择审批人/, "每个审批环节应明确提示选择具体审批人");
  assert.match(app, /APPROVAL_BUILDER_FIELD_TYPE_FALLBACK/, "字段类型接口未加载时仍应可选择填写方式");
  assert.match(app, /function validateApprovalBuilderDraft\(/, "提交前应给出面向业务人员的字段级提示");
  assert.match(app, /key: nextOaTemplateKey\(\)/, "内部模板标识应由系统自动生成");
  assert.match(css, /\.approval-builder-card/, "可视化配置器应有独立的大尺寸布局");
}

// ---------------------------------------------------------------------------
// 11. 审批完成后的执行必须独立于抄送，并支持凭证上传与办结
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  assert.match(html, /待我处理/, "执行待办应与审批待办统一呈现在待我处理列表");
  assert.match(html, /value="executing">待执行/, "审批列表应可筛选待执行状态");
  assert.match(app, /data-oa-execute/, "执行人应有“上传凭证并标记已执行”操作入口");
  assert.match(app, /execution\/evidence/, "执行凭证应上传至独立接口，不能混为申请材料");
  assert.match(app, /data-builder-execution-enabled/, "审批类型配置器应能可视化启用执行环节");
  assert.match(app, /data-builder-executor-search/, "执行人选择器应支持按姓名、部门或岗位搜索");
}

// ---------------------------------------------------------------------------
// 12. 审批页签：抄送查看即已读，待我处理显示实际待办数量
// ---------------------------------------------------------------------------
{
  assert.match(app, /function markUnreadOaCcNoticesRead\(/, "应提供抄送消息一键标记已读逻辑");
  assert.match(app, /scopeTab\.dataset\.oaScope === "cc"/, "打开抄送我的页签时应自动清除未读提示");
  assert.match(app, /if \(detail\.isCc\) markUnreadOaCcNoticesRead/, "实际打开被抄送单据后也应清除未读提示");
  assert.match(app, /todoTab\.innerHTML = `待我处理/, "待我处理页签应显示红色待办计数");
  assert.match(app, /aria-label="\$\{todoCount\} 项待我处理"/, "待办计数应具备无障碍说明");
}

// ---------------------------------------------------------------------------
// 11. 学部主任兼任任课教师：一个账号同时展示主任和老师入口
// ---------------------------------------------------------------------------
{
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const storage = await fs.readFile(new URL("../server/storage.js", import.meta.url), "utf-8");
  assert.match(app, /function isTeacherAccount\(/, "前端应按兼岗能力判断老师身份，而不是只判断主岗位");
  assert.match(app, /allowedRoles\.some\(\(role\) => hasAccountRole\(role, account\)\)/, "老师菜单应对兼岗账号可见");
  assert.match(app, /role === "division_head" \? `\$\{baseAccountTitle\} · 任课教师`/, "主任兼课账号应在账户卡标明任课身份");
  assert.match(server, /accountHasAnyRole\(account, allowedRoles\)/, "后端角色鉴权应支持兼岗能力");
  assert.match(server, /accountHasRole\(auth\.account, "teacher"\)/, "老师本人课表、工资确认等接口应允许兼岗账号访问");
  assert.match(storage, /DIVISION_HEAD_TEACHER_CONFIGS/, "四个学部主任应有固定的任课教师档案映射");
}

// ---------------------------------------------------------------------------
// 11. 学部财务只能查看报表，不能导出或打印为文件
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  ["exportWeeklyWorkload", "printWeeklyWorkload", "exportAnnualSalary", "printAnnualSalary"].forEach((id) => {
    assert.match(
      html,
      new RegExp(`id="${id}"[^>]*hidden`),
      `${id} 应默认隐藏，避免学部财务在渲染前看到导出入口`,
    );
  });
  assert.match(app, /function canExportWeeklyWorkloadReport\(/, "工作量台账应有独立导出权限判断");
  assert.match(app, /\["#exportWeeklyWorkload", "#printWeeklyWorkload"\]/, "学部财务应同时隐藏工作量导出和打印");
  assert.match(app, /\["#exportAnnualSalary", "#printAnnualSalary"\]/, "学部财务应同时隐藏年度薪资导出和打印");
  assert.match(styles, /button\[hidden\]\s*\{\s*display:\s*none\s*!important;/, "按钮组件不得覆盖 hidden 属性");
  assert.match(
    server,
    /auth\.account\.role === "finance" && !canExportAllPayrollDetails\(auth\.account\)/,
    "服务端应拒绝学部财务绕过页面导出工作量台账",
  );
}

// ---------------------------------------------------------------------------
// 12. 考核工资按财务录入的分数直接换算，不能再出现等级或核定金额入口
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const payroll = await fs.readFile(new URL("../server/payroll.js", import.meta.url), "utf-8");
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  assert.match(html, /id="salaryAssessmentScore"/, "薪资结算页应提供考核分数输入框");
  assert.match(html, /100 分按 100% 计发；120 分按 120% 计发；80 分按 80% 计发/, "界面应说明分数换算规则");
  assert.doesNotMatch(html, /id="hrAssessGrade"/, "不应再提供考核等级下拉框");
  assert.match(app, /function saveBackendTeacherAssessmentScore\(/, "财务应能保存本月考核分数");
  assert.match(app, /score: Number\(rawScore\)/, "前端应提交考核分数而非等级");
  assert.match(payroll, /const rate = score \/ 100;/, "考核系数必须直接等于分数除以 100");
  assert.match(server, /requireAuth\(req, res, db, \["finance"\]\)/, "考核分数接口只允许财务账号写入");
}

// ---------------------------------------------------------------------------
// 13. 学部财务不应看到或绕过总校财务专属的组织岗位、薪资配置
// ---------------------------------------------------------------------------
{
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  assert.match(
    app,
    /role === "finance" && \["hrOrg", "payrollConfig"\]\.includes\(viewName\) && !canExportAllPayrollDetails\(\)/,
    "学部财务的视图权限应隐藏组织与岗位、薪资配置",
  );
  assert.match(app, /if \(!backendMode\(\) \|\| !canExportAllPayrollDetails\(\)\) return;/, "学部财务不应请求薪资配置接口");
  assert.match(server, /仅总校财务可以查看薪资配置/, "后端应拒绝学部财务读取薪资配置");
  assert.match(server, /仅总校财务可以维护薪资配置/, "后端应拒绝学部财务修改薪资配置");
  assert.match(server, /仅总校财务可以查看组织与岗位/, "后端应拒绝学部财务读取组织与岗位");
}

// ---------------------------------------------------------------------------
// 14. 薪资总览只承载汇总，逐老师结算只能在薪资结算页进行
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const financeStart = html.indexOf('<section class="view" id="financeView"');
  const financeEnd = html.indexOf('<section class="view" id="financeRecordsView"', financeStart);
  const financeMarkup = html.slice(financeStart, financeEnd);
  assert.match(financeMarkup, /财务分组汇总/, "薪资总览应保留汇总信息");
  assert.doesNotMatch(financeMarkup, /老师薪资结算概览/, "薪资总览不应重复展示结算概览");
  assert.doesNotMatch(financeMarkup, /data-finance-settle/, "薪资总览不应提供逐老师结算入口");
  assert.doesNotMatch(financeMarkup, /financeOverviewTable/, "薪资总览不应重复展示教师结算表");
  assert.doesNotMatch(app, /#financeTeacherSearch/, "已移除的首页教师筛选不应继续绑定事件");
}

// ---------------------------------------------------------------------------
// 15. 财务分组汇总只对总校财务开放，学部财务无需重复看到本学部单行汇总
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  assert.match(html, /id="financeGroupPanel"[^>]*hidden/, "分组汇总应默认隐藏，避免学部财务页面闪现");
  assert.match(app, /function setFinanceGroupSummaryVisibility\(\)/, "应集中处理分组汇总的显示权限");
  assert.match(app, /const visible = canExportAllPayrollDetails\(\);/, "分组汇总仅总校财务可见");
}

// ---------------------------------------------------------------------------
// 16. 人员档案提供高层/中层/普通标签，且只允许总校人事 + 行政维护
// ---------------------------------------------------------------------------
{
  const hr = await fs.readFile(new URL("../server/hr.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  assert.match(app, /const HR_MANAGEMENT_LEVELS = \[/, "前端应定义三种人员层级");
  assert.match(app, /function hrManagementLevelTag\(/, "人员列表和详情应展示层级标签");
  assert.match(app, /currentRole\(\) === "system_admin"/, "只有总校人事 + 行政可看到层级编辑项");
  assert.match(hr, /export const MANAGEMENT_LEVELS = \["senior", "middle", "ordinary"\]/, "后端只接受三种人员层级");
  assert.match(hr, /仅总校人事 \+ 行政可以维护人员层级/, "后端必须拒绝其他角色绕过界面维护层级");
  assert.match(styles, /\.management-level-tag/, "人员层级应使用可辨识的小标签样式");
}

// ---------------------------------------------------------------------------
// 17. 退休返聘教师采用协议月薪；仅总校人事 + 行政可维护
// ---------------------------------------------------------------------------
{
  const hr = await fs.readFile(new URL("../server/hr.js", import.meta.url), "utf-8");
  const payroll = await fs.readFile(new URL("../server/payroll.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  assert.match(app, /const HR_EMPLOYMENT_TYPES = \[/, "人员档案应提供正常／协议雇佣类型");
  assert.match(app, /hrEmp-agreementMonthlySalary/, "协议教师应能维护协议月薪");
  assert.match(app, /function hrEmploymentTypeTag\(/, "人员列表应展示雇佣类型标签");
  assert.match(app, /function personnelCompactTags\(/, "人员列表应提供紧凑的层级与雇佣标签");
  assert.match(app, /personnelCompactTags\(row\)/, "人员列表姓名旁应渲染紧凑标签");
  assert.match(hr, /EMPLOYMENT_TYPES = \["normal", "agreement"\]/, "后端只接受正常或协议雇佣类型");
  assert.match(hr, /仅总校人事 \+ 行政可以维护教师雇佣类型和协议月薪/, "协议工资必须由总校人事 + 行政维护");
  assert.match(payroll, /协议教师不再叠加课时、考核、职称、校龄或兼岗项目/, "协议教师应走独立工资口径");
  assert.match(payroll, /holidayFactor \* 0\.8/, "协议工资假期必须按 80% 折算");
  assert.match(styles, /\.employment-type-tag/, "雇佣类型应使用独立标签样式");
  assert.match(styles, /\.personnel-identity-tag/, "人员列表标签应采用紧凑样式，避免挤占表格面积");
}

// ---------------------------------------------------------------------------
// 18. 校历是按账号权限返回的数据；切换演示账号后不得沿用上一账号的列表
// ---------------------------------------------------------------------------
{
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const calendarCacheReset = app.match(/academicCalendarState = initialAcademicCalendarState\(\);/g) || [];
  assert.ok(calendarCacheReset.length >= 2, "登录、退出或切换账号时应清空校历缓存并重新按权限读取");
  assert.match(server, /calendarStageScope = auth\.account\.role === "finance" && auth\.account\.financeReadAll/, "总校财务读取校历应使用全校范围，学部财务仍受学部范围限制");
}

// ---------------------------------------------------------------------------
// 19. 校历由主任直接维护时间段，不再让用户维护学年档案
// ---------------------------------------------------------------------------
{
  const storage = await fs.readFile(new URL("../server/storage.js", import.meta.url), "utf-8");
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  assert.match(html, /id="addAcademicCalendarEntry"/, "校历页应提供新增时间段入口");
  assert.match(html, /id="academicCalendarTypeFilter"/, "校历页应提供正式学期／假期标签筛选");
  assert.doesNotMatch(html, /id="createAcademicYear"/, "校历页不应再要求新建下一学年");
  assert.doesNotMatch(html, /id="academicCalendarYearSelect"/, "校历页不应再暴露学年档案选择");
  assert.match(html, /id="academicCalendarTermLedgerSection"[^>]*hidden/, "归档台账应默认隐藏，避免学部主任看到重复内容");
  assert.match(app, /name: "periodName"/, "主任应直接填写时间段名称");
  assert.match(app, /addButton\.disabled = false/, "新增时间段不应被校历列表的加载状态锁住");
  assert.match(app, /const period = entry \|\| \{\}/, "新增时间段时应能安全处理空的既有时间段");
  assert.match(app, /正式学期 · 秋季学期/, "新增时间段应明确选择正式学期或假期标签");
  assert.match(app, /only.*正式学期|正式学期可排课/, "界面必须说明只有正式学期可排课");
  assert.match(app, /function archiveAcademicCalendarTerm\(/, "总校人事 + 行政应能从校历台账归档历史教学期");
  assert.match(app, /termLedgerSection\.hidden = !canManageAcademicTermLifecycle\(\)/, "学部主任不应看到重复的教学期归档台账");
  assert.match(app, /status\.label !== "已完成"/, "已完成时间段不应渲染更新按钮");
  assert.match(storage, /该时间段已完成，不能再修改/, "后端必须拒绝绕过界面修改已完成时间段");
  assert.match(storage, /inferredSchoolYearFromPeriodName/, "后台应从时间段名称推导兼容历史的学年索引");
  assert.match(storage, /allYears/, "校历接口应支持读取全部历史时间段");
}

// ---------------------------------------------------------------------------
// 20. 所有账号都可从「我的账户」修改自己的密码
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const storage = await fs.readFile(new URL("../server/storage.js", import.meta.url), "utf-8");
  assert.match(app, /myHrProfile:\s*\{\s*role: "all"/s, "我的账户应对所有已登录角色开放");
  assert.match(html, /id="accountSummary"[^>]*type="button"/, "侧栏账户卡应是所有账号可操作的按钮");
  assert.match(app, /function changeOwnPasswordFromAccount\(/, "账户页应提供本人改密动作");
  assert.match(app, /id="myAccountChangePassword"/, "账户页应展示修改密码入口");
  assert.match(app, /currentPassword: values\.currentPassword, newPassword: values\.newPassword/, "前端改密应提交当前密码和新密码");
  assert.match(app, /密码已修改，请使用新密码重新登录/, "改密成功后应明确要求使用新密码重新登录");
  assert.match(server, /url\.pathname === "\/api\/auth\/change-password"/, "服务端应提供本人改密接口");
  assert.match(server, /requireAuth\(req, res, db\)/, "本人改密只要求已登录，不应限制岗位角色");
  assert.match(storage, /revokeAccountSessions\(db, account\.id, "password_changed"\)/, "改密后必须撤销旧会话");
}

// ---------------------------------------------------------------------------
// 21. 总校人事 + 行政可配置并分配自定义人员标签
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const hr = await fs.readFile(new URL("../server/hr.js", import.meta.url), "utf-8");
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  assert.match(html, /data-view="personnelTagConfig" data-role="system_admin"/, "人员标签配置入口只应显示给总校人事 + 行政");
  assert.match(html, /id="personnelTagConfigView"/, "人员标签配置应有独立页面容器");
  assert.match(app, /function canManagePersonnelTags\(/, "前端应统一收口人员标签管理权限");
  assert.match(app, /data-hr-employee-tag=/, "人员档案应提供多选标签分配控件");
  assert.match(app, /\/api\/hr\/personnel-tags/, "前端应调用人员标签接口");
  assert.match(hr, /export function createPersonnelTag\(/, "后端应提供新增人员标签逻辑");
  assert.match(hr, /export function deletePersonnelTag\(/, "后端应提供删除人员标签逻辑");
  assert.match(hr, /仅总校人事 \+ 行政可以配置人员标签/, "后端必须限制标签配置权限");
  assert.match(server, /url\.pathname === "\/api\/hr\/personnel-tags"/, "服务端应暴露人员标签列表与新增接口");
  assert.match(server, /personnelTagMatch/, "服务端应提供删除人员标签接口");
  assert.match(styles, /\.personnel-custom-tag/, "自定义人员标签应采用小标签样式");
}

// ---------------------------------------------------------------------------
// 22. 兼岗任命采用紧凑卡片；人数只在对应任命下显示
// ---------------------------------------------------------------------------
{
  const hr = await fs.readFile(new URL("../server/hr.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  assert.match(app, /data-hr-homeroom-students/, "班主任学生数应有专属容器");
  assert.match(app, /班主任负责学生总数/, "人数输入必须明确是班主任负责的学生数");
  assert.match(app, /data-hr-grade-head-classes/, "年级主任班级数也应独立关联到对应任命");
  assert.match(app, /syncHrAppointmentDependentFields/, "勾选任命后应即时显示对应人数输入");
  assert.match(styles, /\.hr-appointment-role-grid/, "兼岗职务应使用紧凑网格呈现");
  assert.match(styles, /\.hr-appointment-toggle input/, "兼岗复选框需要覆写全局输入框样式");
  assert.match(hr, /班主任负责学生总数/, "后端字段标签也应使用班主任语义");
}

// ---------------------------------------------------------------------------
// 23. 没有可用正式学期时，预算卡片不能通过 render 自我递归
// ---------------------------------------------------------------------------
{
  assert.match(app, /暂无可用正式学期，暂不能查看预算/, "预算页应明确提示没有可用正式学期");
  assert.match(
    app,
    /if \(!termId\) \{\s*termBudgetState = \{ \.\.\.termBudgetState, loaded: true, loading: false, error: "暂无可用正式学期", data: null \};\s*return;/,
    "预算读取不到学期时应直接返回，不能再次调用 render 造成栈溢出",
  );
}

// ---------------------------------------------------------------------------
// 24. 人员档案常规保存自动留痕，不要求逐人填写修改原因
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const hr = await fs.readFile(new URL("../server/hr.js", import.meta.url), "utf-8");
  assert.doesNotMatch(app, /hrEmp-reason/, "人员档案编辑页不应再提供逐次填写的修改原因输入框");
  assert.doesNotMatch(html, /所有修改必须填写原因/, "人员档案页的说明不能继续要求填写修改原因");
  assert.match(html, /所有修改自动保留操作人、时间与字段级审计/, "界面应说明保存后仍会自动留痕");
  assert.match(hr, /常规档案维护（系统自动留痕）/, "后端在未传原因时必须补充自动审计说明");
}

// ---------------------------------------------------------------------------
// 25. 外出申请复用逐节代课安排，并保留原任课老师的正常课时工资
// ---------------------------------------------------------------------------
{
  const oa = await fs.readFile(new URL("../server/oa.js", import.meta.url), "utf-8");
  const scheduling = await fs.readFile(new URL("../server/scheduling.js", import.meta.url), "utf-8");
  const storage = await fs.readFile(new URL("../server/storage.js", import.meta.url), "utf-8");
  assert.match(oa, /key: "outbound"/, "应提供独立的外出申请模板");
  assert.match(oa, /label: "外出原因"/, "外出申请应要求填写外出原因");
  assert.match(oa, /preserveOriginalLessonPay: isOutbound/, "外出安排必须向课表联动传递原老师正常课时工资标识");
  assert.match(app, /\["leave", "outbound"\]/, "外出申请应复用起止日期与上午／下午选择");
  assert.match(app, /原任课老师该节正常课时工资照发/, "学部主任安排外出课程时应明确计薪口径");
  assert.match(scheduling, /lesson\.type = "substitute"/, "代课老师的课次应标记为代课课型");
  assert.match(scheduling, /outboundOriginalTeacherId/, "课表应保留外出原任课老师的计薪归属");
  assert.match(storage, /outboundOriginalPay: true/, "薪资读取时应为外出原老师建立正常课时的计薪投影");
}

// ---------------------------------------------------------------------------
// 26. 教学期由学部主任维护；排课负责人只能选择已有正式学期
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  assert.match(html, /id="adminSchedulingTermSelect"/, "排课页应提供已有正式学期的选择器");
  assert.match(html, /id="termManagementPanel" hidden/, "排课页不应展示旧的教学学期创建入口");
  assert.match(app, /\(panel\) => !panel\.hidden && panel\.querySelector/, "排课分节导航也不应保留已隐藏的教学学期假入口");
  assert.match(app, /function selectableSchedulingTerms\(/, "排课学期应统一过滤为可排课的已有学期");
  assert.match(app, /term\.status !== "archived" && term\.datePhase !== "ended"/, "已归档或已完成学期不应进入排课选择");
  assert.match(app, /function renderSchedulingTermSelector\(/, "排课页应渲染学期下拉选择");
  assert.doesNotMatch(app, /formatTermLabel\(/, "排课页不能调用未定义的学期格式化函数");
  assert.match(styles, /\.nav-item #scheduleNavLabel/, "动态课表标签不能继承导航图标的固定尺寸");
  assert.match(server, /教学学期由学部主任在“学部校历”统一创建；排课负责人只能选择已有正式学期/, "后端应明确拒绝排课负责人新建教学期");
  assert.match(
    server,
    /"admin", "system_admin", "finance", "hr", "division_head", "teacher", "payroll_exporter"/,
    "唯一获准导出的薪资专员账号也应能访问周工作量导出接口",
  );
  assert.doesNotMatch(app, /label: "已完成", value: t\.completed/, "工作量报表不能读取已取消的 completed 旧字段并显示 undefined");
  assert.match(app, /function reportStageOptionsForAccount\(/, "学部报表筛选不应展示账号权限外的学部");
  assert.match(app, /value: "kindergarten", label: "幼儿园"/, "报表学部筛选不能漏掉幼儿园");
}

// ---------------------------------------------------------------------------
// 27. 月度教师考勤由学部主任上传；小学、初中、高中按已确认制度进入工资重算
// ---------------------------------------------------------------------------
{
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const attendance = await fs.readFile(new URL("../server/attendance.js", import.meta.url), "utf-8");
  const storage = await fs.readFile(new URL("../server/storage.js", import.meta.url), "utf-8");
  const payroll = await fs.readFile(new URL("../server/payroll.js", import.meta.url), "utf-8");
  const styles = await fs.readFile(new URL("../styles.css", import.meta.url), "utf-8");
  assert.match(html, /data-view="attendanceManagement" data-role="division_head,system_admin,principal"/, "考勤入口应给学部主任上传、校长与行政查看");
  assert.match(html, /id="attendanceTemplateDownload"/, "考勤页应提供模板下载入口");
  assert.match(html, /id="attendanceUploadFile"/, "考勤页应提供 .xlsx 上传控件");
  assert.match(html, /按各学部已确认的考勤规则纳入未锁定工资核算/, "考勤页说明不应再误称所有学部都只留存、不影响工资");
  assert.doesNotMatch(html, /上传本学部老师的四次打卡记录。系统先校验和留存，暂不自动影响工资核算/, "考勤页不应保留已过时的四次打卡说明");
  assert.match(app, /function uploadAttendanceWorkbook\(/, "前端应提交月度考勤表");
  assert.match(app, /小学部已启用考勤扣款/, "小学部入口应明确已启用考勤扣款规则");
  assert.match(app, /初中部已启用迟到／早退、旷工考勤规则/, "初中部入口应明确已启用考勤规则");
  assert.match(app, /高中部请使用专用考勤结果表/, "高中部入口应提示使用专用结果表");
  assert.match(app, /attendanceTemplateForStage/, "考勤模板应随学部自动切换");
  assert.match(server, /url\.pathname === "\/api\/attendance\/uploads"/, "服务端应提供考勤上传与读取接口");
  assert.match(server, /requireAuth\(req, res, db, \["division_head", "system_admin"\]\)/, "上传接口只允许学部主任或行政管理账号");
  assert.match(attendance, /只能\$\{action\}本学部考勤数据/, "后端必须按学部收敛考勤访问范围");
  assert.match(attendance, /PRIMARY_ATTENDANCE_POLICY/, "考勤模块应声明小学部已确认制度");
  assert.match(attendance, /limit: "07:45"/, "小学部上午迟到阈值应为 7:45");
  assert.match(attendance, /limit: "14:15"/, "小学部下午迟到阈值应为 14:15");
  assert.match(attendance, /lateRate: 30/, "小学部迟到应按 30 元／次处理");
  assert.match(attendance, /missingPunchRate: 50/, "小学部未补卡应按 50 元／次处理");
  assert.match(attendance, /absenceRate: 200/, "小学部旷工应按 200 元／天处理");
  assert.match(attendance, /PRIMARY_MAKEUP_HEADERS/, "小学部模板应要求逐次明确补卡状态");
  assert.match(attendance, /MIDDLE_ATTENDANCE_POLICY/, "考勤模块应保留初中部已确认制度");
  assert.match(attendance, /limit: "07:50"/, "初中部上午迟到阈值应来自打卡通知");
  assert.match(attendance, /limit: "17:25"/, "初中部下午早退阈值应来自打卡通知");
  assert.match(attendance, /absenceRate: 300/, "初中部旷工应按 300 元／天处理");
  assert.match(attendance, /HIGH_ATTENDANCE_POLICY/, "考勤模块应声明高中部已确认制度");
  assert.match(attendance, /minorOccurrenceRate: 0\.02/, "高中部轻微迟到／未签退应从第三次起按考核工资 2% 处理");
  assert.match(attendance, /seriousOccurrenceRate: 0\.03/, "高中部超时迟到／早退应按考核工资 3% 处理");
  assert.match(attendance, /multipleMissedClassRate: 0\.15/, "高中部两节及以上旷课应按考核工资 15% 处理");
  assert.match(attendance, /absenceWorkDailyFraction: 1 \/ 22/, "高中部旷工应按当月工资总额 1/22 处理");
  assert.match(payroll, /当月工资总额 1\/22/, "工资单应展示高中部旷工的日工资口径");
  assert.match(payroll, /componentName/, "工资单应按学部单列对应的考勤扣款");
  assert.match(payroll, /未补卡/, "工资单应在考勤扣款中列出未补卡扣款");
  assert.match(storage, /attendanceSettlementForTeacher/, "工资预览应读取当前版本考勤结算事实");
  assert.match(storage, /attendanceUploads: \[\]/, "数据库应保存考勤上传版本");
  assert.match(storage, /attendancePunchRecords: \[\]/, "数据库应保存标准化打卡明细");
  assert.match(styles, /\.attendance-management-toolbar/, "考勤上传区域应有独立布局样式");
}

console.log("frontend static checks passed");
