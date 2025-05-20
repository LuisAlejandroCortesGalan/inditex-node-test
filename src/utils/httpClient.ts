import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { AxiosResponse } from 'axios';
import config from '../config/config';
import logger from './logger';
import { ExternalApiError, TimeoutError } from '../models/errors';

/**
 * Interfaz para la entrada de caché
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Configuración para la estrategia de caché
 */
interface CacheConfig {
    defaultTtl: number;
    popularResourceMultiplier: number;
}

/**
 * Cliente HTTP resiliente con capacidades de caché y reintentos
 */
export default class HttpClient {
    private instance: AxiosInstance;
    private cache: Map<string, CacheEntry<unknown>>;
    private cacheConfig: CacheConfig;

    /**
     * Constructor para el cliente HTTP
     * @param baseURL URL base para las solicitudes
     * @param timeout Tiempo máximo de espera en ms
     */
    constructor(baseURL: string, timeout = config.requestTimeout) {
        this.instance = axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        this.cache = new Map();
        this.cacheConfig = {
            defaultTtl: config.cacheTtl,
            popularResourceMultiplier: 3 // Los recursos populares duran 3 veces más en caché
        };

        // Configurar interceptores para logging
        this.setupInterceptors();
    }

    /**
     * Configura interceptores para logging de solicitudes y respuestas
     */
    private setupInterceptors(): void {
        this.instance.interceptors.request.use(
            (config) => {
                logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                logger.error('Request error', error);
                return Promise.reject(error);
            }
        );

        this.instance.interceptors.response.use(
            (response) => {
                logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
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

    /**
     * Realiza una solicitud GET con soporte de caché y reintentos
     * @param url URL relativo para la solicitud
     * @param axiosConfig Configuración opcional de Axios
     * @param useCache Indica si se debe utilizar la caché
     * @param maxRetries Número máximo de reintentos
     */
    async get<T>(
        url: string,
        axiosConfig?: AxiosRequestConfig,
        useCache = true,
        maxRetries = config.maxRetries
    ): Promise<T> {
        const cacheKey = `GET:${url}`;

        // Check cache if enabled
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
            onSuccess: (data) => {
                if (useCache) {
                    this.addToCache(cacheKey, data);
                }
            },
        });
    }

    /**
     * Obtiene datos de la caché si son válidos, con TTL variable según popularidad
     * @param key Clave de caché
     */
    private getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!cached) {
            return null;
        }

        const now = Date.now();
        
        // Determinar si es un recurso popular (productos frecuentes o rutas de similarids)
        const isPopularResource = /\/product\/([1-9]|10)(\/|$)/.test(key) || 
                                 key.includes('/similarids');
        
        const effectiveTtl = isPopularResource 
            ? this.cacheConfig.defaultTtl * this.cacheConfig.popularResourceMultiplier
            : this.cacheConfig.defaultTtl;
            
        if (now - cached.timestamp > effectiveTtl) {
            // Cache expired
            this.cache.delete(key);
            logger.debug(`Cache expired for ${key}`);
            return null;
        }

        return cached.data;
    }

    /**
     * Añade datos a la caché
     * @param key Clave de caché
     * @param data Datos a almacenar
     */
    private addToCache<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
        logger.debug(`Added to cache: ${key}`);
    }

    /**
     * Ejecuta una función con reintentos automáticos
     * @param fn Función a ejecutar
     * @param options Opciones de reintento
     */
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
                    // Espera exponencial entre reintentos
                    await new Promise((resolve) =>
                        setTimeout(resolve, config.retryDelay * Math.pow(2, attempt - 1))
                    );
                }

                const response = await fn();

                if (onSuccess) {
                    onSuccess(response.data);
                }

                return response.data;
            } catch (error) {
                lastError = error as Error;

                // No reintentar para ciertos errores
                if (
                    axios.isAxiosError(error) &&
                    error.response &&
                    (error.response.status < 500 && error.response.status !== 429)
                ) {
                    break;
                }
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        if (lastError) {
            if (
                (axios.isAxiosError(lastError) && lastError.code === 'ECONNABORTED') ||
                lastError.message?.toLowerCase().includes('timeout')
            ) {
                throw new TimeoutError(`Request timeout for ${method} ${url}`);
            }

            if (axios.isAxiosError(lastError) && lastError.response) {
                throw new ExternalApiError(
                    `Request to ${url} failed with status ${lastError.response.status}: ${lastError.response.data?.message || lastError.message
                    }`,
                    lastError.response.status
                );
            }
        }

        throw new ExternalApiError(`Request to ${url} failed: ${lastError?.message || 'Unknown error'}`);
    }

    /**
     * Limpia la caché del cliente
     */
    clearCache(): void {
        this.cache.clear();
        logger.debug('HTTP client cache cleared');
    }

    /**
     * Invalida entradas de caché que coincidan con un patrón
     * @param pattern Patrón para hacer coincidir con las claves de caché
     */
    invalidateCache(pattern?: string): void {
        if (!pattern) {
            this.clearCache();
            return;
        }
        
        let count = 0;
        // Invalidar solo las entradas que coincidan con el patrón
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                count++;
            }
        }
        logger.debug(`Invalidated ${count} cache entries matching pattern: ${pattern}`);
    }
}