export type AppRole = "user" | "tester" | "admin" | "owner";

export const ROLE_HIERARCHY: AppRole[] = ["user", "tester", "admin", "owner"];
export const ASSIGNABLE_ADMIN_ROLES: AppRole[] = ["user", "tester", "admin"];

function getRoleRank(role: AppRole | null): number {
  if (!role) return -1;
  return ROLE_HIERARCHY.indexOf(role);
}

export function normalizeAppRole(value: unknown): AppRole | null {
  switch (value) {
    case "user":
    case "tester":
    case "admin":
    case "owner":
      return value;
    default:
      return null;
  }
}

export function hasAdminAccess(role: AppRole | null): boolean {
  return role === "admin" || role === "owner";
}

export function hasUnlimitedQuota(role: AppRole | null): boolean {
  return role === "tester" || role === "admin" || role === "owner";
}

export function canManageAdminAccounts(role: AppRole | null): boolean {
  return role === "owner";
}

export function canManageRole(
  actorRole: AppRole | null,
  targetRole: AppRole | null,
): boolean {
  return getRoleRank(actorRole) > getRoleRank(targetRole);
}

export function getAssignableRoles(
  actorRole: AppRole | null,
  targetRole?: AppRole | null,
): AppRole[] {
  if (targetRole !== undefined && !canManageRole(actorRole, targetRole)) {
    return [];
  }

  return ASSIGNABLE_ADMIN_ROLES.filter((role) => getRoleRank(actorRole) > getRoleRank(role));
}
