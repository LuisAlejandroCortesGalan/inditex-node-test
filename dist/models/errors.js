'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ValidationError =
  exports.TimeoutError =
  exports.ExternalApiError =
  exports.NotFoundError =
  exports.AppError =
    void 0;
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}
exports.NotFoundError = NotFoundError;
class ExternalApiError extends AppError {
  constructor(message, statusCode = 500) {
    super(message, statusCode);
  }
}
exports.ExternalApiError = ExternalApiError;
class TimeoutError extends AppError {
  constructor(message = 'Request timeout') {
    super(message, 408);
  }
}
exports.TimeoutError = TimeoutError;
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map
