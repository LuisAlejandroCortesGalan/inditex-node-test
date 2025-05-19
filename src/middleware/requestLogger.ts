import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

/**
 * Middleware para asignar un ID único a cada solicitud para seguimiento
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.id || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
};

/**
 * Middleware para registrar información sobre cada solicitud HTTP
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  logger.info(`Incoming request`, {
    method: req.method,
    path: req.originalUrl,
    id: req.id,
    ip: req.ip,
  });
  
  // Sobrescribir res.end para loggear cuando la respuesta se complete
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, callback?: any) {
    const responseTime = Date.now() - startTime;
    
    logger.info(`Outgoing response`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      id: req.id,
    });
    
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};