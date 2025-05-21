'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const http_status_codes_1 = require('http-status-codes');
const errors_1 = require('../models/errors');
const logger_1 = __importDefault(require('../utils/logger'));
const notFoundHandler = (req, _res, next) => {
  const error = new errors_1.AppError(
    `Cannot find ${req.originalUrl} on this server!`,
    http_status_codes_1.StatusCodes.NOT_FOUND
  );
  next(error);
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, req, res, _next) => {
  let statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let isOperational = false;
  if (err instanceof errors_1.AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'SyntaxError') {
    statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON format';
    isOperational = true;
  }
  const logLevel = isOperational ? 'warn' : 'error';
  logger_1.default[logLevel](`${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    error: err.stack,
  });
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
