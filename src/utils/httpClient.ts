import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { AxiosResponse } from 'axios';
import http from 'http';
import https from 'https';
import config from '../config/config';
import logger from './logger';
import { ExternalApiError, TimeoutError } from '../models/errors';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheConfig {
  defaultTtl: number;
  popularResourceMultiplier: number;
}

export default class HttpClient {
  private instance: AxiosInstance;
  private cache: Map<string, CacheEntry<unknown>>;
  private cacheConfig: CacheConfig;

  constructor(baseURL: string, timeout = config.requestTimeout) {
    const httpAgent = new http.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      timeout: timeout,
    });

    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      timeout: timeout,
    });

    this.instance = axios.create({
      baseURL,
      timeout,
      httpAgent,
      httpsAgent,
      headers: {
        'Content-Type': 'application/json',
      },
      maxRedirects: 5,
      decompress: true,
    });

    this.cache = new Map();
    this.cacheConfig = {
      defaultTtl: config.cacheTtl,
      popularResourceMultiplier: 3,
    };

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      config => {
        logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        logger.error('Request error', error);
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      response => {
        logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
        return response;
      },
      error => {
        if (error.response) {
          logger.error(
            `HTTP Error: ${error.response.status} ${error.config.url} - ${error.response.data}`
          );
        } else if (error.code === 'ECONNABORTED') {
          logger.error(`Request timeout: ${error.config.url}`);
        } else {
          logger.error(`HTTP Request failed: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(
    url: string,
    axiosConfig?: AxiosRequestConfig,
    useCache = true,
    maxRetries = config.maxRetries
  ): Promise<T> {
    const cacheKey = `GET:${url}`;

    if (useCache) {
      const cachedResponse = this.getFromCache<T>(cacheKey);
      if (cachedResponse) {
        logger.debug(`Cache hit for ${url}`);
        return cachedResponse;
      }
    }

    return this.executeWithRetry<T>(() => this.instance.get<T>(url, axiosConfig), {
      url,
      method: 'GET',
      maxRetries,
      onSuccess: data => {
        if (useCache) {
          this.addToCache(cacheKey, data);
        }
      },
    });
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!cached) return null;

    const now = Date.now();

    const isPopularResource =
      /\/product\/([1-9]|10)(\/|$)/.test(key) || key.includes('/similarids');

    const effectiveTtl = isPopularResource
      ? this.cacheConfig.defaultTtl * this.cacheConfig.popularResourceMultiplier
      : this.cacheConfig.defaultTtl;

    if (now - cached.timestamp > effectiveTtl) {
      this.cache.delete(key);
      logger.debug(`Cache expired for ${key}`);
      return null;
    }

    return cached.data;
  }

  private addToCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    logger.debug(`Added to cache: ${key}`);
  }

  private async executeWithRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
    options: {
      url: string;
      method: string;
      maxRetries: number;
      onSuccess?: (data: T) => void;
    }
  ): Promise<T> {
    const { url, method, maxRetries, onSuccess } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.info(`Retry attempt ${attempt} for ${method} ${url}`);
          await new Promise(resolve =>
            setTimeout(resolve, config.retryDelay * Math.pow(2, attempt - 1))
          );
        }

        const response = await fn();
        if (onSuccess) onSuccess(response.data);
        return response.data;
      } catch (error) {
        lastError = error as Error;

        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status < 500 &&
          error.response.status !== 429
        ) {
          break;
        }
      }
    }

    if (lastError) {
      if (
        (axios.isAxiosError(lastError) && lastError.code === 'ECONNABORTED') ||
        lastError.message?.toLowerCase().includes('timeout')
      ) {
        throw new TimeoutError(`Request timeout for ${method} ${url}`);
      }

      if (axios.isAxiosError(lastError) && lastError.response) {
        throw new ExternalApiError(
          `Request to ${url} failed with status ${lastError.response.status}: ${
            lastError.response.data?.message || lastError.message
          }`,
          lastError.response.status
        );
      }
    }

    throw new ExternalApiError(
      `Request to ${url} failed: ${lastError?.message || 'Unknown error'}`
    );
  }

  clearCache(): void {
    this.cache.clear();
    logger.debug('HTTP client cache cleared');
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.clearCache();
      return;
    }

    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    logger.debug(`Invalidated ${count} cache entries matching pattern: ${pattern}`);
  }
}
