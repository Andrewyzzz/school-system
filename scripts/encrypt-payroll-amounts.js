#!/usr/bin/env node
// 把存量工资单的金额块加密（验收清单 3.25 / 7.16）
//
//   node scripts/encrypt-payroll-amounts.js --check   只统计，不改库
//   node scripts/encrypt-payroll-amounts.js           执行
//
// 新写入的工资单由持久层自动加密，本脚本只处理加密上线前已存在的历史数据。
// 逐行加密后校验能原样解回，任何一行对不上就整批中止——工资数据不接受"大部分成功"。
import pg from "pg";
import {
  CIPHER_FIELD,
  ENCRYPTED_BLOCKS,
  decryptRowFromStorage,
  encryptRowForStorage,
  isRowEncrypted,
} from "../server/security/payrollCrypto.js";
import { piiEncryptionReady } from "../server/security/pii.js";

const CONN =
  process.env.DATABASE_URL ||
  process.env.PG_CONNECTION_STRING ||
  "postgresql://localhost:5432/school_system_dev";
const checkOnly = process.argv.includes("--check");
const COLLECTION = "payrollDetails";
const TABLE = `"app_${COLLECTION}"`;

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  if (!piiEncryptionReady()) {
    console.error("HR_ENCRYPTION_KEY 未配置，无法加密。请先设置环境变量。");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: CONN });
  await client.connect();
  console.log(`数据库: ${CONN.replace(/:[^:@/]*@/, ":****@")}`);
  console.log("");

  const { rows } = await client.query(`SELECT id, data FROM ${TABLE} ORDER BY id`);
  const encrypted = rows.filter((r) => isRowEncrypted(r.data));
  const plain = rows.filter((r) => !isRowEncrypted(r.data));

  console.log(`工资单共 ${rows.length} 份：已加密 ${encrypted.length}，待加密 ${plain.length}`);
  const blocks = ENCRYPTED_BLOCKS[COLLECTION];
  console.log(`加密字段：${blocks.join("、")} → ${CIPHER_FIELD}`);
  console.log("");

  if (!plain.length) {
    console.log("没有需要处理的明文工资单。");
    await client.end();
    return;
  }
  if (checkOnly) {
    console.log("（--check 模式，未修改数据库）");
    await client.end();
    return;
  }

  // 先在内存里全部加密并逐行回验，全部通过才落库
  const prepared = [];
  for (const row of plain) {
    const cipherRow = encryptRowForStorage(COLLECTION, row.data);
    const roundTrip = decryptRowFromStorage(COLLECTION, cipherRow);
    for (const key of blocks) {
      if (!sameJson(row.data[key], roundTrip[key])) {
        console.error(`✗ 工资单 ${row.id} 的 ${key} 加解密后不一致，整批中止，未修改任何数据。`);
        await client.end();
        process.exit(1);
      }
    }
    prepared.push({ id: row.id, data: cipherRow });
  }
  console.log(`✓ ${prepared.length} 份全部通过加解密回验`);

  await client.query("BEGIN");
  try {
    for (const item of prepared) {
      await client.query(`UPDATE ${TABLE} SET data = $2::jsonb, updated_at = now() WHERE id = $1`, [
        item.id,
        JSON.stringify(item.data),
      ]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  console.log(`✓ 已加密 ${prepared.length} 份并落库`);

  // 落库后再抽查一次，确认库里确实是密文且能解回
  const { rows: after } = await client.query(`SELECT id, data FROM ${TABLE} ORDER BY id`);
  const stillPlain = after.filter((r) => !isRowEncrypted(r.data));
  console.log("");
  console.log(`复查：${after.length} 份中仍为明文 ${stillPlain.length} 份`);
  if (stillPlain.length) {
    console.error("✗ 仍有明文工资单，请检查");
    process.exit(1);
  }
  const sample = decryptRowFromStorage(COLLECTION, after[0].data);
  console.log(`抽查 ${after[0].id}：应发 ${sample.summarySnapshot?.grossPay ?? "(无)"}，明细 ${(sample.rowsSnapshot || []).length} 行`);
  await client.end();
}

main().catch((error) => {
  console.error("执行失败:", error.message);
  process.exit(1);
});
