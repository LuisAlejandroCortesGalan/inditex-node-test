'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const winston_1 = __importDefault(require('winston'));
const config_1 = __importDefault(require('../config/config'));
const logger = winston_1.default.createLogger({
  level: config_1.default.logLevel,
  format: winston_1.default.format.combine(
    winston_1.default.format.timestamp(),
    winston_1.default.format.errors({ stack: true }),
    winston_1.default.format.splat(),
    winston_1.default.format.json()
  ),
  defaultMeta: { service: 'similar-products-api' },
  transports: [
    new winston_1.default.transports.Console({
      format: winston_1.default.format.combine(
        winston_1.default.format.colorize(),
        winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      ),
    }),
  ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map
