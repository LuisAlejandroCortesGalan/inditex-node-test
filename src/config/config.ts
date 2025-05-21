import dotenv from 'dotenv';

dotenv.config();

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

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  externalApiBaseUrl: process.env.EXTERNAL_API_BASE_URL || 'http://localhost:3001',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '3000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.RETRY_DELAY || '300', 10),
  cacheTtl: parseInt(process.env.CACHE_TTL || '60000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10', 10),
};

export default config;
