import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(options.message);
  },
});

export const productLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many product requests, please try again later.',
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Product rate limit exceeded for IP: ${req.ip}`);
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(options.message);
  },
});
