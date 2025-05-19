interface Config {
    port: number;
    externalApiBaseUrl: string;
    requestTimeout: number;
    maxRetries: number;
    retryDelay: number;
    cacheTtl: number;
    logLevel: string;
}
declare const config: Config;
export default config;
