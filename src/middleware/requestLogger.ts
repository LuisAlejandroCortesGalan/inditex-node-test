import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

declare module 'http' {
  interface OutgoingMessage {
    __responseStartTime?: number;
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.id || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  res.__responseStartTime = Date.now();

  logger.info(`Incoming request`, {
    method: req.method,
    path: req.originalUrl,
    id: req.id,
    ip: req.ip,
  });

  res.on('finish', () => {
    const responseTime = Date.now() - (res.__responseStartTime || 0);

    logger.info(`Outgoing response`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      id: req.id,
    });
  });

  next();
};
