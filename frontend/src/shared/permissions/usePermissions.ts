import { useAuth } from '@/app/providers/auth-provider';

/**
 * Extends useAuth() with module-aware helpers.
 */
export function usePermissions() {
  const { user, can } = useAuth();

  /**
   * Has ANY permission in a module (e.g. "leads" → "leads:read" OR "leads:*")
   */
  const canAny = (module: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.permissions.some(
      (p) => p === `${module}:*` || p.startsWith(`${module}:`)
    );
  };

  /**
   * Has a specific permission (delegates to AuthProvider)
   */
  const canDo = (permission: string): boolean => can(permission);

  /**
   * Has multiple permissions at once
   */
  const canAll = (...permissions: string[]): boolean =>
    permissions.every((p) => can(p));

  /**
   * Has at least one of the given permissions
   */
  const canOneOf = (...permissions: string[]): boolean =>
    permissions.some((p) => can(p));

  return { user, can, canAny, canDo, canAll, canOneOf };
}
