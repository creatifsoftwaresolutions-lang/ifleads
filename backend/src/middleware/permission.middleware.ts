import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { ForbiddenError } from '../shared/errors.js';

export function requirePermission(...required: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(new ForbiddenError('Not authenticated'));

    if (user.role === 'ADMIN') return next();

    const ok = required.every((perm) => {
      if (user.permissions.has(perm)) return true;
      const [mod] = perm.split(':');
      return user.permissions.has(`${mod}:*`);
    });

    if (!ok) {
      return next(
        new ForbiddenError(`Missing permission: ${required.join(', ')}`)
      );
    }
    next();
  };
}
