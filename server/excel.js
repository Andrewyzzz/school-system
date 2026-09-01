// SpreadsheetML 2003 工作簿生成（纯文本、零依赖，Excel 与 WPS 均可直接打开）
//
// 课表、工作量台账、年度薪资汇总三处都要导出 Excel，样式与转义规则一致，
// 所以抽在这里统一维护。
//
// 关键一点：金额与课时必须以 **Number** 类型写入，不能写成字符串。
// 学校财务拿到报表后要自己拉合计、做透视，字符串数字在 Excel 里既不能求和
// 也不能排序——那样导出的就只是一张"看起来像表格的图片"。

const XML_ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

export function escapeXml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => XML_ESCAPE[c]);
}

// 工作表名不能含 : \ / ? * [ ]，且不超过 31 字符，否则 Excel 报"文件已损坏"
export function sheetNameOf(title, fallback = "报表") {
  return String(title ?? "").replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || fallback;
}

function border(color = "#B8BFC7") {
  return ["Left", "Top", "Right", "Bottom"]
    .map((p) => `<Border ss:Position="${p}" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${color}"/>`)
    .join("");
}

// 共用样式表。金额用两位小数千分位，课时用一位小数（存在半节课的情况）。
const STYLES = `
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="宋体" ss:Size="11"/>
  </Style>
  <Style ss:ID="title">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="黑体" ss:Size="16" ss:Bold="1"/>
  </Style>
  <Style ss:ID="subtitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="宋体" ss:Size="10" ss:Color="#666666"/>
  </Style>
  <Style ss:ID="head">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="黑体" ss:Size="11" ss:Bold="1"/>
   <Interior ss:Color="#EDF0F4" ss:Pattern="Solid"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="label">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="宋体" ss:Size="10"/>
   <Interior ss:Color="#F7F8FA" ss:Pattern="Solid"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="cell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="宋体" ss:Size="10"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="text">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="宋体" ss:Size="10"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="number">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="宋体" ss:Size="10"/>
   <NumberFormat ss:Format="0.#"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="money">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="宋体" ss:Size="10"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="total">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="黑体" ss:Size="10" ss:Bold="1"/>
   <Interior ss:Color="#F0F4F8" ss:Pattern="Solid"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="totalMoney">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="黑体" ss:Size="10" ss:Bold="1"/>
   <Interior ss:Color="#F0F4F8" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="totalNumber">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="黑体" ss:Size="10" ss:Bold="1"/>
   <Interior ss:Color="#F0F4F8" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="0.#"/>
   <Borders>${border()}</Borders>
  </Style>
  <Style ss:ID="warn">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="宋体" ss:Size="10" ss:Color="#B4232C"/>
   <Borders>${border()}</Borders>
  </Style>
 </Styles>`;

// 数字样式：值必须以 Number 类型写出，否则 Excel 里无法求和
const NUMERIC_STYLES = new Set(["number", "money", "totalMoney", "totalNumber"]);

/**
 * 一个单元格。
 *   value  单元格内容
 *   style  样式 ID（见上表）
 *   merge  向右合并的**额外**列数（MergeAcross 语义：1 表示占两列）
 */
export function cell(value, style = "cell", merge = 0) {
  return { value, style, merge };
}

export function row(cells, height = 0) {
  return { cells, height };
}

function renderCell(item) {
  const style = item.style || "cell";
  const numeric = NUMERIC_STYLES.has(style);
  const merge = item.merge ? ` ss:MergeAcross="${item.merge}"` : "";

  // 数字格中的空值写成空单元格，而不是 0——"这个月没发工资"和"这个月发了 0 元"
  // 在对账时含义不同，写 0 会让财务以为已核算过。
  if (numeric && (item.value === "" || item.value === null || item.value === undefined)) {
    return `<Cell ss:StyleID="${style}"${merge}/>`;
  }
  const type = numeric && Number.isFinite(Number(item.value)) ? "Number" : "String";
  const value = type === "Number" ? Number(item.value) : escapeXml(item.value);
  return `<Cell ss:StyleID="${style}"${merge}><Data ss:Type="${type}">${value}</Data></Cell>`;
}

function renderRow(item) {
  const height = item.height ? ` ss:Height="${item.height}"` : "";
  if (!item.cells || item.cells.length === 0) return `<Row${height}/>`;
  return `<Row${height}>${item.cells.map(renderCell).join("")}</Row>`;
}

/**
 * 生成工作簿。
 *   sheets: [{ name, title, subtitle, columns:[宽度], rows:[row()], freezeRows, orientation }]
 * 有 title 时自动加标题行、副标题行与一行留白，freezeRows 相应顺延。
 */
export function buildWorkbook(sheets = []) {
  const list = Array.isArray(sheets) ? sheets : [sheets];
  const used = new Set();

  const body = list
    .map((sheet) => {
      const columns = sheet.columns || [];
      const span = Math.max(columns.length, 1) - 1;

      const head = [];
      if (sheet.title) {
        head.push(row([cell(sheet.title, "title", span)], 30));
        if (sheet.subtitle) head.push(row([cell(sheet.subtitle, "subtitle", span)], 20));
        head.push(row([], 6));
      }
      const rows = [...head, ...(sheet.rows || [])];

      // 工作表名必须唯一，重名会让 Excel 拒绝打开整个文件
      let name = sheetNameOf(sheet.name || sheet.title);
      if (used.has(name)) {
        let n = 2;
        while (used.has(sheetNameOf(`${name}(${n})`))) n += 1;
        name = sheetNameOf(`${name}(${n})`);
      }
      used.add(name);

      const freeze = sheet.freezeRows ? head.length + sheet.freezeRows : 0;
      const orientation = sheet.orientation || "Landscape";

      return `
 <Worksheet ss:Name="${escapeXml(name)}">
  <Table>
   ${columns.map((w) => `<Column ss:Width="${w}"/>`).join("")}
   ${rows.map(renderRow).join("\n   ")}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="${orientation}" xmlns:x="urn:schemas-microsoft-com:office:excel"/>
   </PageSetup>${
     freeze
       ? `
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>${freeze}</SplitHorizontal>
   <TopRowBottomPane>${freeze}</TopRowBottomPane>
   <ActivePane>2</ActivePane>`
       : ""
   }
  </WorksheetOptions>
 </Worksheet>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${STYLES}${body}
</Workbook>`;
}

/** 导出文件名：去空格、去路径分隔符，避免下载时被浏览器截断或落到别的目录 */
export function exportFilename(parts, ext = "xls") {
  return `${parts
    .filter(Boolean)
    .map((p) => String(p).replace(/\s+/g, "").replace(/[\\/:*?"<>|]/g, "-"))
    .join("-")}.${ext}`;
}
