import { ReactNode } from 'react';
import { useAuth } from '@/app/providers/auth-provider';

interface Props {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders `children` only if the user has the permission.
 * Frontend UX only — backend always enforces.
 */
export function CanDo({ permission, children, fallback = null }: Props) {
  const { can } = useAuth();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}
