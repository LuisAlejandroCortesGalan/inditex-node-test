"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("./logger"));
const errors_1 = require("../models/errors");
class HttpClient {
    constructor(baseURL, timeout = config_1.default.requestTimeout) {
        this.instance = axios_1.default.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.cache = new Map();
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.instance.interceptors.request.use((config) => {
            logger_1.default.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.default.error('Request error', error);
            return Promise.reject(error);
        });
        this.instance.interceptors.response.use((response) => {
            logger_1.default.debug(`HTTP Response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            if (error.response) {
                logger_1.default.error(`HTTP Error: ${error.response.status} ${error.config.url} - ${error.response.data}`);
            }
            else if (error.code === 'ECONNABORTED') {
                logger_1.default.error(`Request timeout: ${error.config.url}`);
            }
            else {
                logger_1.default.error(`HTTP Request failed: ${error.message}`);
            }
            return Promise.reject(error);
        });
    }
    async get(url, axiosConfig, useCache = true, maxRetries = config_1.default.maxRetries) {
        const cacheKey = `GET:${url}`;
        if (useCache) {
            const cachedResponse = this.getFromCache(cacheKey);
            if (cachedResponse) {
                logger_1.default.debug(`Cache hit for ${url}`);
                return cachedResponse;
            }
        }
        return this.executeWithRetry(() => this.instance.get(url, axiosConfig), {
            url,
            method: 'GET',
            maxRetries,
            onSuccess: (data) => {
                if (useCache) {
                    this.addToCache(cacheKey, data);
                }
            },
        });
    }
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) {
            return null;
        }
        const now = Date.now();
        if (now - cached.timestamp > config_1.default.cacheTtl) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    addToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
    async executeWithRetry(fn, options) {
        const { url, method, maxRetries, onSuccess } = options;
        let lastError = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    logger_1.default.info(`Retry attempt ${attempt} for ${method} ${url}`);
                    await new Promise((resolve) => setTimeout(resolve, config_1.default.retryDelay * Math.pow(2, attempt - 1)));
                }
                const response = await fn();
                if (onSuccess) {
                    onSuccess(response.data);
                }
                return response.data;
            }
            catch (error) {
                lastError = error;
                if (axios_1.default.isAxiosError(error) &&
                    error.response &&
                    (error.response.status < 500 && error.response.status !== 429)) {
                    break;
                }
            }
        }
        if (lastError) {
            if ((axios_1.default.isAxiosError(lastError) && lastError.code === 'ECONNABORTED') ||
                lastError.message?.toLowerCase().includes('timeout')) {
                throw new errors_1.TimeoutError(`Request timeout for ${method} ${url}`);
            }
            if (axios_1.default.isAxiosError(lastError) && lastError.response) {
                throw new errors_1.ExternalApiError(`Request to ${url} failed with status ${lastError.response.status}: ${lastError.response.data?.message || lastError.message}`, lastError.response.status);
            }
        }
        throw new errors_1.ExternalApiError(`Request to ${url} failed: ${lastError?.message || 'Unknown error'}`);
    }
    clearCache() {
        this.cache.clear();
        logger_1.default.debug('HTTP client cache cleared');
    }
}
exports.default = HttpClient;
//# sourceMappingURL=httpClient.js.map