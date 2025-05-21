import request from 'supertest';
import express, { Application } from 'express';
import http from 'http';
import { setupSwagger } from './swagger';

describe('Swagger Documentation', () => {
  let app: Application;
  let server: http.Server;

  beforeEach((done) => {
    app = express();
    setupSwagger(app);
    server = app.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('should serve Swagger UI on /api-docs', async () => {
    const response = await request(app).get('/api-docs');
    expect(response.status).toBe(301);
    expect(response.header.location).toBe('/api-docs/');
  });

  it('should provide OpenAPI specification at /api-docs.json', async () => {
    const response = await request(app).get('/api-docs.json');
    
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    
    const body = response.body;
    expect(body.openapi).toBe('3.0.0');
    expect(body.info).toBeDefined();
    expect(body.info.title).toBe('Similar Products API');
    expect(body.paths).toBeDefined();
  });
});