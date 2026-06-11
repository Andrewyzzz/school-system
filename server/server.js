import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createToken, verifyPassword } from "./auth.js";
import { previewTeacherImport } from "./importTeachers.js";
import {
  ensureDatabase,
  findAccountByUsername,
  findTeacher,
  publicAccount,
  queryTeachers,
  teacherLessonsForWeek,
  teacherPayrollPreview,
} from "./storage.js";

const PORT = Number.parseInt(process.env.PORT || "4173", 10);
const PUBLIC_ROOT = fileURLToPath(new URL("../", import.meta.url));
const sessions = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    error: {
      message,
      details,
    },
  });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf-8");
  return JSON.parse(raw);
}

function bearerToken(req) {
  const authorization = req.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

function requireAuth(req, res, db, allowedRoles = []) {
  const token = bearerToken(req);
  const session = sessions.get(token);
  if (!session) {
    sendError(res, 401, "请先登录");
    return null;
  }

  const account = db.accounts.find((item) => item.id === session.accountId);
  if (!account || account.status !== "active") {
    sessions.delete(token);
    sendError(res, 401, "账号不可用，请重新登录");
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(account.role)) {
    sendError(res, 403, "当前账号无权访问该资源");
    return null;
  }

  return { account, token };
}

function canReadTeacher(account, teacherId) {
  if (["admin", "finance", "system_admin"].includes(account.role)) return true;
  return account.role === "teacher" && account.teacherId === teacherId;
}

function teacherIdFromPath(parts) {
  return parts.length >= 3 ? parts[2] : "";
}

async function handleApi(req, res, db, url) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const parts = url.pathname.split("/").filter(Boolean);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        status: "ok",
        service: "school-system-phase1-api",
        teacherCount: db.teachers.length,
        accountCount: db.accounts.length,
        seedVersion: db.meta.seedVersion,
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readJsonBody(req);
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const account = findAccountByUsername(db, username);

      if (!account || account.status !== "active" || !verifyPassword(password, account.passwordHash)) {
        sendError(res, 401, "用户名或密码错误");
        return;
      }

      const token = createToken();
      sessions.set(token, {
        accountId: account.id,
        createdAt: new Date().toISOString(),
      });

      sendJson(res, 200, {
        token,
        account: publicAccount(account, db),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      const token = bearerToken(req);
      if (token) sessions.delete(token);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      sendJson(res, 200, {
        account: publicAccount(auth.account, db),
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/reference") {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      sendJson(res, 200, {
        stages: db.stages,
        subjects: db.subjects,
        classes: db.classes,
        rooms: db.rooms,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/teachers") {
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, queryTeachers(db, Object.fromEntries(url.searchParams)));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/teachers/import/preview") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const csvText = String(body.csvText || "");
      sendJson(res, 200, previewTeacherImport(db, csvText));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/teachers/me") {
      const auth = requireAuth(req, res, db, ["teacher"]);
      if (!auth) return;
      const teacher = findTeacher(db, auth.account.teacherId);
      sendJson(res, 200, { teacher });
      return;
    }

    if (parts[0] === "api" && parts[1] === "teachers" && parts.length >= 3) {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      const teacherId = teacherIdFromPath(parts);

      if (!canReadTeacher(auth.account, teacherId)) {
        sendError(res, 403, "只能访问本人教师数据");
        return;
      }

      const teacher = findTeacher(db, teacherId);
      if (!teacher) {
        sendError(res, 404, "教师不存在");
        return;
      }

      if (req.method === "GET" && parts.length === 3) {
        sendJson(res, 200, { teacher });
        return;
      }

      if (req.method === "GET" && parts[3] === "schedule") {
        const weekStart = url.searchParams.get("weekStart") || "2026-06-15";
        sendJson(res, 200, {
          teacher,
          weekStart,
          lessons: teacherLessonsForWeek(db, teacherId, weekStart),
        });
        return;
      }

      if (req.method === "GET" && parts[3] === "payroll") {
        const month = url.searchParams.get("month") || "2026-06";
        sendJson(res, 200, teacherPayrollPreview(db, teacherId, month));
        return;
      }
    }

    sendError(res, 404, "接口不存在");
  } catch (error) {
    const isBadJson = error instanceof SyntaxError;
    sendError(res, isBadJson ? 400 : 500, isBadJson ? "请求 JSON 格式错误" : "服务端错误", error.message);
  }
}

async function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const absolutePath = path.normalize(path.join(PUBLIC_ROOT, requestedPath));

  if (!absolutePath.startsWith(PUBLIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(absolutePath);
    const filePath = stat.isDirectory() ? path.join(absolutePath, "index.html") : absolutePath;
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = await fs.readFile(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not found");
  }
}

export async function createServer() {
  const db = await ensureDatabase();

  return http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, db, url);
      return;
    }

    await serveStatic(req, res, url);
  });
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  const server = await createServer();
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`School system demo running at http://127.0.0.1:${PORT}/`);
    console.log(`API health: http://127.0.0.1:${PORT}/api/health`);
  });
}
