export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', msg);
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') {
    super(403, 'FORBIDDEN', msg);
  }
}

export class NotFoundError extends AppError {
  constructor(msg = 'Not found') {
    super(404, 'NOT_FOUND', msg);
  }
}

export class ConflictError extends AppError {
  constructor(msg = 'Conflict') {
    super(409, 'CONFLICT', msg);
  }
}

export class ValidationError extends AppError {
  constructor(msg: string, public details?: any) {
    super(422, 'VALIDATION', msg);
  }
}
