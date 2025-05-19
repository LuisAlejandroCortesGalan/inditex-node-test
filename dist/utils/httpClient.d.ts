import { AxiosRequestConfig } from 'axios';
export default class HttpClient {
    private instance;
    private cache;
    constructor(baseURL: string, timeout?: number);
    private setupInterceptors;
    get<T>(url: string, axiosConfig?: AxiosRequestConfig, useCache?: boolean, maxRetries?: number): Promise<T>;
    private getFromCache;
    private addToCache;
    private executeWithRetry;
    clearCache(): void;
}
