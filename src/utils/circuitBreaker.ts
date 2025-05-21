import logger from './logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Implementación del patrón Circuit Breaker para mayor resiliencia.
 * Previene cascada de fallos cuando un servicio externo falla repetidamente.
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: CircuitState = 'CLOSED';

  constructor(
    private readonly name: string,
    private readonly failureThreshold = 5,
    private readonly resetTimeout = 30000
  ) {
    logger.info(
      `CircuitBreaker [${name}] initialized with threshold=${failureThreshold}, resetTimeout=${resetTimeout}ms`
    );
  }

  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        logger.info(`CircuitBreaker [${this.name}] state changing from OPEN to HALF_OPEN`);
        this.state = 'HALF_OPEN';
      } else {
        logger.debug(`CircuitBreaker [${this.name}] is OPEN - fast failing`);
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
        logger.info(
          `CircuitBreaker [${this.name}] closed after successful execution in HALF_OPEN state`
        );
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(
        `CircuitBreaker [${this.name}] registered failure: ${errorMessage}. Count: ${this.failures}/${this.failureThreshold}`
      );

      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        logger.error(
          `CircuitBreaker [${this.name}] changed to OPEN after ${this.failures} consecutive failures`
        );
      }

      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    logger.debug(`CircuitBreaker [${this.name}] has been reset to CLOSED state`);
  }
}
