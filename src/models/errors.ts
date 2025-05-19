/**
 * Error base para la aplicación
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error para recursos no encontrados
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

/**
 * Error para problemas de comunicación con APIs externas
 */
export class ExternalApiError extends AppError {
  constructor(message: string, statusCode = 500) {
    super(message, statusCode);
  }
}

/**
 * Error para timeout en solicitudes
 */
export class TimeoutError extends AppError {
  constructor(message = 'Request timeout') {
    super(message, 408);
  }
}

/**
 * Error para validación de datos
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}