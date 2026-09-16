import assert from "node:assert/strict";
import { commitTeacherImport, previewTeacherImport } from "../server/importTeachers.js";
import { createInitialData } from "../server/storage.js";

const db = createInitialData({ teacherCount: 1 });
const csv = [
  "employeeNo,name,stageId,department,primarySubjectId,username,title,nonSchedulable,lifeTeacher",
  "FY260907-2001,生活老师甲,primary,小学部,,fy260907-2001,生活老师,true,true",
  "FY260907-2002,学部主任乙,middle,初中部,,fy260907-2002,初中学部主任,true,false",
].join("\n");

const preview = previewTeacherImport(db, csv, { includeAllRows: true });
assert.equal(preview.canImport, true, JSON.stringify(preview.errors));
assert.equal(preview.validRows, 2);

commitTeacherImport(db, csv, { id: "TEST", name: "测试" });
const lifeTeacher = db.teachers.find((teacher) => teacher.employeeNo === "FY260907-2001");
const lifeAccount = db.accounts.find((account) => account.username === "fy260907-2001");
assert.equal(lifeTeacher.primarySubjectId, "");
assert.equal(lifeTeacher.nonSchedulable, true);
assert.equal(lifeTeacher.salaryProfile.salaryCategory, "lifeTeacher");
assert.deepEqual(lifeAccount.roles, ["teacher", "life_teacher"]);

const head = db.teachers.find((teacher) => teacher.employeeNo === "FY260907-2002");
assert.equal(head.primarySubjectId, "");
assert.equal(head.nonSchedulable, true);

console.log("非排课人员与生活老师导入测试通过");
