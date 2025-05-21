'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.requestLogger = exports.requestIdMiddleware = void 0;
const uuid_1 = require('uuid');
const logger_1 = __importDefault(require('../utils/logger'));
const requestIdMiddleware = (req, res, next) => {
  req.id = req.id || (0, uuid_1.v4)();
  res.setHeader('X-Request-Id', req.id);
  next();
};
exports.requestIdMiddleware = requestIdMiddleware;
const requestLogger = (req, res, next) => {
  res.__responseStartTime = Date.now();
  logger_1.default.info(`Incoming request`, {
    method: req.method,
    path: req.originalUrl,
    id: req.id,
    ip: req.ip,
  });
  res.on('finish', () => {
    const responseTime = Date.now() - (res.__responseStartTime || 0);
    logger_1.default.info(`Outgoing response`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      id: req.id,
    });
  });
  next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map
