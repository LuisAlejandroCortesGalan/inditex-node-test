import request from 'supertest';
import http from 'http';
import { StatusCodes } from 'http-status-codes';

const mockGetSimilarProducts = jest.fn();

jest.mock('../controllers/productController', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        getSimilarProducts: mockGetSimilarProducts,
      };
    }),
  };
});

import app from '../app';

describe('Product Routes', () => {
  let server: http.Server;
  
  beforeAll((done) => {
    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /product/:productId/similar', () => {
    it('should return similar products successfully', async () => {
      const mockProducts = [
        { id: '2', name: 'Product 2', price: 19.99, availability: true },
        { id: '3', name: 'Product 3', price: 29.99, availability: false },
      ];

      mockGetSimilarProducts.mockImplementation((_req, res) => {
        res.status(StatusCodes.OK).json(mockProducts);
      });

      const response = await request(app).get('/product/1/similar');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
    });

    it('should return empty array when no similar products found', async () => {
      mockGetSimilarProducts.mockImplementation((_req, res) => {
        res.status(StatusCodes.OK).json([]);
      });

      const response = await request(app).get('/product/999/similar');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle errors correctly', async () => {
      mockGetSimilarProducts.mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await request(app).get('/product/1/similar');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Invalid routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/invalid-path');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
});