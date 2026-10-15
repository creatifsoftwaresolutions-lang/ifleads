import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../shared/errors.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'VALIDATION',
      issues: err.issues.map((i) => ({
        path: i.path,
        message: i.message,
      })),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      error: 'VALIDATION',
      message: err.message,
      details: err.details,
    });
  }
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: err.message,
    });
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: err.message,
    });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: err.message,
    });
  }
  if (err instanceof ConflictError) {
    return res.status(409).json({
      error: 'CONFLICT',
      message: err.message,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    error: 'INTERNAL',
    message:
      env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : String(err),
  });
}
