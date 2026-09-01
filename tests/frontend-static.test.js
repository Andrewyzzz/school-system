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
// 2. 渲染函数用到的模块级状态，必须声明在顶层 render() 之前
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
// 3. 视图注册表、导航、渲染函数三者要对得上
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
}

console.log("frontend static checks passed");
