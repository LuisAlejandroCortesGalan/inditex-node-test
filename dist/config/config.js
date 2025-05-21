'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config();
const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  externalApiBaseUrl: process.env.EXTERNAL_API_BASE_URL || 'http://localhost:3001',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '3000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.RETRY_DELAY || '300', 10),
  cacheTtl: parseInt(process.env.CACHE_TTL || '60000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10', 10),
};
exports.default = config;
//# sourceMappingURL=config.js.map
