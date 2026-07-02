import { resetDatabase } from "./storage.js";

const teacherCount = Number.parseInt(process.env.TEACHER_COUNT || "1000", 10);
const db = await resetDatabase({ teacherCount });

console.log(`Seeded ${db.teachers.length} teachers.`);
console.log(`Seeded ${db.accounts.length} accounts.`);
console.log("Default password: 123456");
console.log("Admin account: admin / 123456");
console.log("Finance account: finance / 123456");
console.log("System admin account: sysadmin / 123456");
console.log("Teacher accounts: teacher0001 ... teacher1000 / 123456");
