import { ProductDetail, SimilarProductIds, SimilarProducts } from './productModels';
import { AppError, NotFoundError, ExternalApiError } from './errors';

describe('Product Models', () => {
  describe('ProductDetail', () => {
    it('should create a valid product detail object', () => {
      const product: ProductDetail = {
        id: '1',
        name: 'Test Product',
        price: 19.99,
        availability: true,
      };

      expect(product.id).toBe('1');
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(19.99);
      expect(product.availability).toBe(true);
    });
  });

  describe('SimilarProductIds', () => {
    it('should create a valid array of product IDs', () => {
      const similarIds: SimilarProductIds = ['1', '2', '3'];

      expect(Array.isArray(similarIds)).toBe(true);
      expect(similarIds.length).toBe(3);
      expect(similarIds[0]).toBe('1');
    });
  });

  describe('SimilarProducts', () => {
    it('should create a valid array of product details', () => {
      const products: SimilarProducts = [
        {
          id: '1',
          name: 'Product 1',
          price: 19.99,
          availability: true,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 29.99,
          availability: false,
        },
      ];

      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(2);
      expect(products[0].name).toBe('Product 1');
      expect(products[1].availability).toBe(false);
    });
  });
});

describe('Error Models', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError('General error', 500);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('General error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('should create NotFoundError with status code 404', () => {
    const error = new NotFoundError('Resource not found');

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create ExternalApiError with default status code 500', () => {
    const error = new ExternalApiError('External API failed');

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('External API failed');
    expect(error.statusCode).toBe(500);
  });
  afterAll(() => {
    jest.restoreAllMocks();

    jest.useRealTimers();
  });
});
