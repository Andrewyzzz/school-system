function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function teacherPayrollVisibleMonths(term = null) {
  const startMonth = String(term?.startDate || "").slice(0, 7);
  const endMonth = String(term?.endDate || "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(startMonth) || !/^\d{4}-\d{2}$/.test(endMonth) || startMonth > endMonth) {
    return [];
  }

  const [startYear, startIndex] = startMonth.split("-").map(Number);
  const [endYear, endIndex] = endMonth.split("-").map(Number);
  const months = [];
  let year = startYear;
  let month = startIndex;
  while (year < endYear || (year === endYear && month <= endIndex)) {
    months.push(monthKey(year, month));
    month += 1;
    if (month === 13) {
      year += 1;
      month = 1;
    }
    // 学期不应超过两年；上限同时避免错误配置造成死循环。
    if (months.length >= 24) break;
  }
  return months;
}

export function canTeacherAccessPayrollMonth(month, term = null) {
  return teacherPayrollVisibleMonths(term).includes(String(month || "").slice(0, 7));
}
