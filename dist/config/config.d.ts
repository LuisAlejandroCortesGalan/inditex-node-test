interface Config {
  port: number;
  externalApiBaseUrl: string;
  requestTimeout: number;
  maxRetries: number;
  retryDelay: number;
  cacheTtl: number;
  logLevel: string;
  maxConcurrentRequests: number;
  circuitBreakerFailureThreshold?: number;
  circuitBreakerResetTimeout?: number;
}
declare const config: Config;
export default config;
