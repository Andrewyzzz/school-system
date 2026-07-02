# 数据库说明

当前代码运行时仍使用 `server/data/phase1-db.json` 作为开发期数据仓库；这里开始沉淀正式数据库结构。

## 已有内容

- `postgres/001_phase1_schema.sql`：第一阶段 PostgreSQL 建表脚本，覆盖账号、老师、学期、班级、教室、排课、课次、扫码考勤、工资、通知和审计日志。
- `server/exportPostgresData.js`：把当前 `server/data/phase1-db.json` 导出为 PostgreSQL 数据导入 SQL。

## 推荐执行方式

在正式服务器上创建 PostgreSQL 数据库后执行：

```bash
psql "$DATABASE_URL" -f database/postgres/001_phase1_schema.sql
```

导出当前开发库数据：

```bash
node server/exportPostgresData.js --output database/postgres/generated/phase1-data.sql
```

导入数据：

```bash
psql "$DATABASE_URL" -f database/postgres/generated/phase1-data.sql
```

## 下一步

1. 把 `server/storage.js` 的 JSON 读写抽象成 repository 接口。
2. 增加 PostgreSQL repository，让 API 路由不变，只切换底层数据源。
3. 增加数据库备份、恢复、迁移回滚和初始化检查脚本。

正式试运行前，数据库至少要完成 repository 接入和迁移脚本；仅有 schema 还不等于系统已经切到 SQL。
