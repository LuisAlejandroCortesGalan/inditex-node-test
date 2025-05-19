export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare class NotFoundError extends AppError {
    constructor(message: string);
}
export declare class ExternalApiError extends AppError {
    constructor(message: string, statusCode?: number);
}
export declare class TimeoutError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
