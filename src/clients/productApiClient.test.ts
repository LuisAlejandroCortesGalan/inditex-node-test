import ProductApiClient from './productApiClient';
import HttpClient from '../utils/httpClient';
import { NotFoundError } from '../models/errors';

// Mock del HttpClient
jest.mock('../utils/httpClient');

describe('ProductApiClient', () => {
  let productApiClient: ProductApiClient;
  let mockHttpClient: jest.Mocked<HttpClient>;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Configurar el mock de HttpClient
    mockHttpClient = new HttpClient('') as jest.Mocked<HttpClient>;
    (HttpClient as jest.Mock).mockImplementation(() => mockHttpClient);
    
    // Crear instancia de ProductApiClient con el HttpClient mockeado
    productApiClient = new ProductApiClient('https://api.example.com');
  });
  
  describe('getSimilarProductIds', () => {
    it('should return similar product IDs successfully', async () => {
      const mockSimilarIds = ['2', '3', '4'];
      mockHttpClient.get.mockResolvedValueOnce(mockSimilarIds);
      
      const result = await productApiClient.getSimilarProductIds('1');
      
      expect(result).toEqual(mockSimilarIds);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/product/1/similarids');
    });
    
    it('should throw NotFoundError when no similar products found', async () => {
      const notFoundError = new NotFoundError('Not found');
      notFoundError.statusCode = 404;
      
      mockHttpClient.get.mockRejectedValueOnce(notFoundError);
      
      await expect(productApiClient.getSimilarProductIds('999')).rejects.toThrow(NotFoundError);
    });
    
    it('should propagate other errors', async () => {
      const serverError = new Error('Server error');
      mockHttpClient.get.mockRejectedValueOnce(serverError);
      
      await expect(productApiClient.getSimilarProductIds('1')).rejects.toThrow('Server error');
    });
  });
  
  describe('getProductDetail', () => {
    it('should return product details successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        price: 19.99,
        availability: true,
      };
      
      mockHttpClient.get.mockResolvedValueOnce(mockProduct);
      
      const result = await productApiClient.getProductDetail('1');
      
      expect(result).toEqual(mockProduct);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/product/1');
    });
    
    it('should throw NotFoundError when product not found', async () => {
      const notFoundError = new NotFoundError('Product not found');
      notFoundError.statusCode = 404;
      
      mockHttpClient.get.mockRejectedValueOnce(notFoundError);
      
      await expect(productApiClient.getProductDetail('999')).rejects.toThrow(NotFoundError);
    });
    
    it('should propagate other errors', async () => {
      const serverError = new Error('Server error');
      mockHttpClient.get.mockRejectedValueOnce(serverError);
      
      await expect(productApiClient.getProductDetail('1')).rejects.toThrow('Server error');
    });
  });
  
  describe('clearCache', () => {
    it('should clear the HttpClient cache', () => {
      productApiClient.clearCache();
      
      expect(mockHttpClient.clearCache).toHaveBeenCalled();
    });
  });
});