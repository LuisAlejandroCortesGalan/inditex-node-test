import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../models/errors';
import logger from '../utils/logger';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(
    `Cannot find ${req.originalUrl} on this server!`,
    StatusCodes.NOT_FOUND
  );
  next(error);
};

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'SyntaxError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON format';
    isOperational = true;
  }

  const logLevel = isOperational ? 'warn' : 'error';
  logger[logLevel](`${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    error: err.stack,
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
