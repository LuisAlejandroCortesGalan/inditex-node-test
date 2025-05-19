import request from 'supertest';
import app from '../app';
import ProductService from '../services/productService';

// Mock del ProductService
jest.mock('../services/productService');

describe('Product Routes', () => {
  let mockProductService: jest.Mocked<ProductService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar el mock del servicio
    mockProductService = new ProductService() as jest.Mocked<ProductService>;
    
    // Asegurarse de que el constructor de ProductService devuelve nuestro mock
    (ProductService as jest.Mock).mockImplementation(() => mockProductService);
  });
  
  describe('GET /product/:productId/similar', () => {
    it('should return similar products successfully', async () => {
      const mockProducts = [
        { id: '2', name: 'Product 2', price: 19.99, availability: true },
        { id: '3', name: 'Product 3', price: 29.99, availability: false },
      ];
      
      mockProductService.getSimilarProducts.mockResolvedValueOnce(mockProducts);
      
      const response = await request(app).get('/product/1/similar');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(mockProductService.getSimilarProducts).toHaveBeenCalledWith('1');
    });
    
    it('should return empty array when no similar products found', async () => {
      mockProductService.getSimilarProducts.mockResolvedValueOnce([]);
      
      const response = await request(app).get('/product/999/similar');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    
    it('should handle errors correctly', async () => {
      mockProductService.getSimilarProducts.mockRejectedValueOnce(new Error('Service error'));
      
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