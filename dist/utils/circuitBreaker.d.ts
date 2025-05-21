export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export declare class CircuitBreaker {
  private readonly name;
  private readonly failureThreshold;
  private readonly resetTimeout;
  private failures;
  private lastFailureTime;
  private state;
  constructor(name: string, failureThreshold?: number, resetTimeout?: number);
  execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
  getState(): CircuitState;
  private reset;
}
