import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { apiLimiter, productLimiter } from './rateLimiter';

jest.mock('express-rate-limit', () => {
  return (options: any) => {
    const mockLimiter = (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('RateLimit-Limit', options.max.toString());
      res.setHeader('RateLimit-Remaining', (options.max - 1).toString());
      res.setHeader('RateLimit-Reset', '60');
      
      if (req.path === '/test-exceeded') {
        return options.handler(req, res, next, {
          message: options.message
        });
      }
      
      next();
    };
    
    return mockLimiter;
  };
});

describe('Rate Limiter', () => {
  let app: Application;
  let server: http.Server;

  beforeEach((done) => {
    app = express();
    
    app.use(apiLimiter);
    app.use('/product', productLimiter);
    
    app.get('/test', (_req, res) => res.status(200).json({ message: 'success' }));
    app.get('/test-exceeded', (_req, res) => res.status(200).json({ message: 'never reached' }));
    app.get('/product/test', (_req, res) => res.status(200).json({ message: 'product success' }));
    app.get('/product/test-exceeded', (_req, res) => res.status(200).json({ message: 'never reached' }));
    
    server = app.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  describe('API Limiter', () => {
    it('should allow requests under the limit', async () => {
      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'success' });
    });

    it('should include rate limit headers', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should block requests when limit is exceeded', async () => {
      const response = await request(app).get('/test-exceeded');
      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Too many requests');
    });
  });

  describe('Product Limiter', () => {
    it('should apply stricter limits to product routes', async () => {
      const response = await request(app).get('/product/test');
      
      const limit = parseInt(response.headers['ratelimit-limit'] as string);
      expect(limit).toBe(50);
    });

    it('should block product requests when limit is exceeded', async () => {
      const response = await request(app).get('/product/test-exceeded');
      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Too many product requests');
    });
  });
});