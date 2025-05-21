'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.CircuitBreaker = void 0;
const logger_1 = __importDefault(require('./logger'));
class CircuitBreaker {
  constructor(name, failureThreshold = 5, resetTimeout = 30000) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
    logger_1.default.info(
      `CircuitBreaker [${name}] initialized with threshold=${failureThreshold}, resetTimeout=${resetTimeout}ms`
    );
  }
  async execute(fn, fallback) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        logger_1.default.info(
          `CircuitBreaker [${this.name}] state changing from OPEN to HALF_OPEN`
        );
        this.state = 'HALF_OPEN';
      } else {
        logger_1.default.debug(`CircuitBreaker [${this.name}] is OPEN - fast failing`);
        if (fallback) {
          return fallback();
        }
        throw new Error(`CircuitBreaker [${this.name}] is OPEN`);
      }
    }
    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.reset();
        logger_1.default.info(
          `CircuitBreaker [${this.name}] closed after successful execution in HALF_OPEN state`
        );
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger_1.default.warn(
        `CircuitBreaker [${this.name}] registered failure: ${errorMessage}. Count: ${this.failures}/${this.failureThreshold}`
      );
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        logger_1.default.error(
          `CircuitBreaker [${this.name}] changed to OPEN after ${this.failures} consecutive failures`
        );
      }
      throw error;
    }
  }
  getState() {
    return this.state;
  }
  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    logger_1.default.debug(`CircuitBreaker [${this.name}] has been reset to CLOSED state`);
  }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=circuitBreaker.js.map
