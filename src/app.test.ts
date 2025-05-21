import request from 'supertest';
import http from 'http';
import app from './app';

describe('App', () => {
  let server: http.Server;
  
  beforeAll((done) => {
    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 for the health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI', async () => {
      const response = await request(app).get('/api-docs');
      
      expect(response.status).toBe(301);
      expect(response.header.location).toBe('/api-docs/');
    });

    it('should provide OpenAPI specification JSON', async () => {
      const response = await request(app).get('/api-docs.json');
      
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      
      expect(response.body.openapi).toBeDefined();
      expect(response.body.info).toBeDefined();
      expect(response.body.paths).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting headers to responses', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
      
      expect(parseInt(response.headers['ratelimit-remaining'] as string)).toBeGreaterThan(0);
      expect(response.status).toBe(200);
    });
  });
});