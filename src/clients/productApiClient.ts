import HttpClient from '../utils/httpClient';
import config from '../config/config';
import logger from '../utils/logger';
import { ProductDetail, SimilarProductIds } from '../models/productModels';
import { NotFoundError } from '../models/errors';
import { CircuitBreaker } from '../utils/circuitBreaker';

export default class ProductApiClient {
  private client: HttpClient;
  private similarIdsCircuitBreaker: CircuitBreaker;
  private productDetailCircuitBreaker: CircuitBreaker;

  constructor(baseURL = config.externalApiBaseUrl) {
    this.client = new HttpClient(baseURL);
    logger.debug(`ProductApiClient initialized with baseURL: ${baseURL}`);

    this.similarIdsCircuitBreaker = new CircuitBreaker('similar-ids', 3, 15000);
    this.productDetailCircuitBreaker = new CircuitBreaker('product-detail', 5, 30000);
  }

  async getSimilarProductIds(productId: string): Promise<SimilarProductIds> {
    try {
      logger.info(`Fetching similar product IDs for product: ${productId}`);

      const similarIds = await this.similarIdsCircuitBreaker.execute<SimilarProductIds>(
        () => this.client.get<SimilarProductIds>(`/product/${productId}/similarids`),
        () => {
          logger.warn(
            `Circuit open for similarIds - returning empty array for product: ${productId}`
          );
          return Promise.resolve([]);
        }
      );

      logger.debug(`Found ${similarIds.length} similar products for product ${productId}`);
      return similarIds;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Circuit')) {
        logger.warn(`Circuit breaker prevented request for product ${productId}`);
        return [];
      }

      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        logger.warn(`No similar products found for product: ${productId}`);
        throw new NotFoundError(`No similar products found for product: ${productId}`);
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching similar product IDs for product ${productId}: ${errorMessage}`);
      throw error;
    }
  }

  async getProductDetail(productId: string): Promise<ProductDetail> {
    try {
      logger.info(`Fetching product details for product: ${productId}`);

      const isKnownSlowProduct = ['1000', '10000'].includes(productId);
      const timeout = isKnownSlowProduct
        ? Math.min(config.requestTimeout, 2000)
        : config.requestTimeout;

      const productDetail = await this.productDetailCircuitBreaker.execute<ProductDetail>(() =>
        this.client.get<ProductDetail>(`/product/${productId}`, { timeout })
      );

      return productDetail;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Circuit')) {
        logger.warn(`Circuit breaker prevented request for product details ${productId}`);
        throw new NotFoundError(
          `Product details not available due to circuit breaker: ${productId}`
        );
      }

      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        logger.warn(`Product not found: ${productId}`);
        throw new NotFoundError(`Product not found: ${productId}`);
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching product details for ${productId}: ${errorMessage}`);
      throw error;
    }
  }

  clearCache(): void {
    this.client.clearCache();
    logger.debug('ProductApiClient cache cleared');
  }
}
