const ROLE_HIERARCHY: Record<string, number> = {
  visitor: 1,
  contributor: 2,
  editor: 3,
  senior_editor: 4,
  admin: 5,
  super_admin: 6,
};

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userRoleLower = userRole?.toLowerCase();
  const requiredRoleLower = requiredRole?.toLowerCase();
  return (ROLE_HIERARCHY[userRoleLower] ?? 0) >= (ROLE_HIERARCHY[requiredRoleLower] ?? 99);
}
