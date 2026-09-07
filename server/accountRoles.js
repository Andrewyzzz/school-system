// 账号的主岗位仍放在 role（决定登录后的默认工作台），roles 是可叠加的业务能力。
// 例如学部主任同时任课时：role = division_head，roles = [division_head, teacher]。
// 把兼岗判定集中在这里，避免前后端各自用 account.role 写死后出现越权或漏菜单。
export function accountRoleList(account = {}) {
  const secondaryRoles = Array.isArray(account.roles) ? account.roles : [];
  return [...new Set([account.role, ...secondaryRoles].filter(Boolean).map(String))];
}

export function accountHasRole(account, role) {
  return accountRoleList(account).includes(String(role));
}

export function accountHasAnyRole(account, roles = []) {
  return roles.some((role) => accountHasRole(account, role));
}
