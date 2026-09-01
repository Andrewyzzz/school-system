// multipart/form-data 解析（验收 1.5 证件附件上传）
//
// 项目零依赖，所以自己解。两处必须做对：
//
// 1. **全程用 Buffer，不能转字符串**。一张 JPEG 里是任意字节，
//    转成 utf-8 再转回来会把非法序列替换成 U+FFFD，文件就坏了——
//    而且坏得很隐蔽：小图可能还能打开，大图打不开但没人知道为什么。
//
// 2. **边读边限大小，不能读完再判**。读完再判意味着一个 1GB 的上传
//    会先把 1GB 塞进内存，然后我们礼貌地回一句"文件过大"——
//    那时服务已经被撑死了。所以超限就立刻断开。

const CRLF = Buffer.from("\r\n");
const DOUBLE_CRLF = Buffer.from("\r\n\r\n");

export class UploadError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function boundaryOf(contentType = "") {
  // boundary 可能带引号：multipart/form-data; boundary="----abc"
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  const raw = (match?.[1] || match?.[2] || "").trim();
  return raw || "";
}

/** 解析一节的头部，返回 { name, filename, contentType } */
function parsePartHeaders(headerBuf) {
  const headers = headerBuf.toString("utf-8").split("\r\n");
  const out = { name: "", filename: "", contentType: "" };
  for (const line of headers) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (key === "content-disposition") {
      // filename 里可能有中文与空格，也可能被 RFC 5987 编码
      out.name = /\bname="([^"]*)"/.exec(value)?.[1] || "";
      const star = /\bfilename\*=(?:UTF-8'')?([^;]+)/i.exec(value)?.[1];
      out.filename = star
        ? decodeURIComponent(star.trim().replace(/^"|"$/g, ""))
        : /\bfilename="([^"]*)"/.exec(value)?.[1] || "";
    } else if (key === "content-type") {
      out.contentType = value;
    }
  }
  return out;
}

/**
 * 读取并解析 multipart 请求体。
 * 返回 { fields: {名称: 字符串}, files: [{ name, filename, contentType, data }] }。
 *
 * maxBytes 是整个请求体的上限，超过立刻中止连接。
 */
export function parseMultipart(req, options = {}) {
  const { maxBytes = 10 * 1024 * 1024, maxFiles = 5 } = options;
  const boundary = boundaryOf(req.headers["content-type"]);
  if (!boundary) {
    return Promise.reject(new UploadError("请求不是有效的 multipart/form-data"));
  }

  // Content-Length 靠不住（可以伪造或缺失），但它对的时候能让我们
  // 在读第一个字节之前就拒绝，省掉整次传输
  const declared = Number(req.headers["content-length"] || 0);
  if (declared && declared > maxBytes) {
    return Promise.reject(
      new UploadError(`文件过大：${(declared / 1024 / 1024).toFixed(1)} MB，上限 ${maxBytes / 1024 / 1024} MB`, 413),
    );
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let settled = false;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      // 主动断开：不断开的话客户端会把剩下的几百兆继续推过来
      req.destroy();
      reject(error);
    };

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        fail(new UploadError(`文件过大，上限 ${maxBytes / 1024 / 1024} MB`, 413));
        return;
      }
      chunks.push(chunk);
    });

    req.on("error", (error) => fail(new UploadError(`读取上传内容失败：${error.message}`)));

    req.on("end", () => {
      if (settled) return;
      settled = true;
      try {
        resolve(splitParts(Buffer.concat(chunks), boundary, maxFiles));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function splitParts(body, boundary, maxFiles) {
  const delimiter = Buffer.from(`--${boundary}`);
  const fields = {};
  const files = [];

  let cursor = body.indexOf(delimiter);
  if (cursor < 0) throw new UploadError("上传内容格式不正确：找不到分隔符");

  while (cursor >= 0) {
    cursor += delimiter.length;
    // 结束标记是 --boundary--
    if (body[cursor] === 0x2d && body[cursor + 1] === 0x2d) break;
    // 跳过分隔符后的 CRLF
    if (body.slice(cursor, cursor + 2).equals(CRLF)) cursor += 2;

    const headerEnd = body.indexOf(DOUBLE_CRLF, cursor);
    if (headerEnd < 0) break;
    const meta = parsePartHeaders(body.slice(cursor, headerEnd));

    const contentStart = headerEnd + DOUBLE_CRLF.length;
    const next = body.indexOf(delimiter, contentStart);
    if (next < 0) throw new UploadError("上传内容不完整");

    // 内容与下一个分隔符之间有一个 CRLF，属于协议不属于文件
    let contentEnd = next;
    if (body.slice(contentEnd - 2, contentEnd).equals(CRLF)) contentEnd -= 2;
    const data = body.slice(contentStart, contentEnd);

    if (meta.filename) {
      if (files.length >= maxFiles) throw new UploadError(`一次最多上传 ${maxFiles} 个文件`);
      files.push({ name: meta.name, filename: meta.filename, contentType: meta.contentType, data });
    } else if (meta.name) {
      fields[meta.name] = data.toString("utf-8");
    }

    cursor = next;
  }

  return { fields, files };
}

export { boundaryOf };
