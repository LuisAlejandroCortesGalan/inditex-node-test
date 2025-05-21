import ProductService from './productService';
import ProductApiClient from '../clients/productApiClient';
import { NotFoundError } from '../models/errors';

jest.mock('../clients/productApiClient');

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductApiClient: jest.Mocked<ProductApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductApiClient = new ProductApiClient() as jest.Mocked<ProductApiClient>;
    productService = new ProductService(mockProductApiClient);
  });

  describe('getSimilarProducts', () => {
    it('should return similar products successfully', async () => {
      const mockSimilarIds = ['2', '3', '4'];
      const mockProducts = [
        { id: '2', name: 'Product 2', price: 19.99, availability: true },
        { id: '3', name: 'Product 3', price: 29.99, availability: false },
        { id: '4', name: 'Product 4', price: 39.99, availability: true },
      ];

      mockProductApiClient.getSimilarProductIds.mockResolvedValueOnce(mockSimilarIds);

      mockProductApiClient.getProductDetail
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1])
        .mockResolvedValueOnce(mockProducts[2]);

      const result = await productService.getSimilarProducts('1');

      expect(result).toEqual(mockProducts);
      expect(mockProductApiClient.getSimilarProductIds).toHaveBeenCalledWith('1');
      expect(mockProductApiClient.getProductDetail).toHaveBeenCalledTimes(3);
    });

    it('should handle failed product detail requests gracefully', async () => {
      const mockSimilarIds = ['2', '3', '4'];
      const mockProducts = [
        { id: '2', name: 'Product 2', price: 19.99, availability: true },
        { id: '4', name: 'Product 4', price: 39.99, availability: true },
      ];

      mockProductApiClient.getSimilarProductIds.mockResolvedValueOnce(mockSimilarIds);

      mockProductApiClient.getProductDetail
        .mockResolvedValueOnce(mockProducts[0])
        .mockRejectedValueOnce(new Error('Failed to get product 3'))
        .mockResolvedValueOnce(mockProducts[1]);

      const result = await productService.getSimilarProducts('1');

      expect(result).toEqual([mockProducts[0], mockProducts[1]]);
      expect(mockProductApiClient.getSimilarProductIds).toHaveBeenCalledWith('1');
      expect(mockProductApiClient.getProductDetail).toHaveBeenCalledTimes(3);
    });

    it('should return empty array when no similar products found', async () => {
      mockProductApiClient.getSimilarProductIds.mockResolvedValueOnce([]);

      const result = await productService.getSimilarProducts('1');

      expect(result).toEqual([]);
      expect(mockProductApiClient.getProductDetail).not.toHaveBeenCalled();
    });

    it('should return empty array when product not found', async () => {
      mockProductApiClient.getSimilarProductIds.mockRejectedValueOnce(
        new NotFoundError('Product not found')
      );

      const result = await productService.getSimilarProducts('999');

      expect(result).toEqual([]);
      expect(mockProductApiClient.getProductDetail).not.toHaveBeenCalled();
    });

    it('should propagate unexpected errors', async () => {
      const serverError = new Error('Server error');
      mockProductApiClient.getSimilarProductIds.mockRejectedValueOnce(serverError);

      await expect(productService.getSimilarProducts('1')).rejects.toThrow('Server error');
    });
  });
});
