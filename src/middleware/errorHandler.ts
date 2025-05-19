import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../models/errors';
import logger from '../utils/logger';

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND);
  next(error);
};

/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let isOperational = false;

  // Si es uno de nuestros errores personalizados
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // Errores de validación (por ejemplo, de Joi o express-validator)
    statusCode = StatusCodes.BAD_REQUEST;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'SyntaxError') {
    // Errores de sintaxis JSON
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON format';
    isOperational = true;
  }

  // Registrar el error
  const logLevel = isOperational ? 'warn' : 'error';
  logger[logLevel](`${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    error: err.stack,
  });

  // Responder al cliente
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};