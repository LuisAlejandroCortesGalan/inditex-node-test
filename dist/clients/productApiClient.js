'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const httpClient_1 = __importDefault(require('../utils/httpClient'));
const config_1 = __importDefault(require('../config/config'));
const logger_1 = __importDefault(require('../utils/logger'));
const errors_1 = require('../models/errors');
const circuitBreaker_1 = require('../utils/circuitBreaker');
class ProductApiClient {
  constructor(baseURL = config_1.default.externalApiBaseUrl) {
    this.client = new httpClient_1.default(baseURL);
    logger_1.default.debug(`ProductApiClient initialized with baseURL: ${baseURL}`);
    this.similarIdsCircuitBreaker = new circuitBreaker_1.CircuitBreaker('similar-ids', 3, 15000);
    this.productDetailCircuitBreaker = new circuitBreaker_1.CircuitBreaker(
      'product-detail',
      5,
      30000
    );
  }
  async getSimilarProductIds(productId) {
    try {
      logger_1.default.info(`Fetching similar product IDs for product: ${productId}`);
      const similarIds = await this.similarIdsCircuitBreaker.execute(
        () => this.client.get(`/product/${productId}/similarids`),
        () => {
          logger_1.default.warn(
            `Circuit open for similarIds - returning empty array for product: ${productId}`
          );
          return Promise.resolve([]);
        }
      );
      logger_1.default.debug(
        `Found ${similarIds.length} similar products for product ${productId}`
      );
      return similarIds;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Circuit')) {
        logger_1.default.warn(`Circuit breaker prevented request for product ${productId}`);
        return [];
      }
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        logger_1.default.warn(`No similar products found for product: ${productId}`);
        throw new errors_1.NotFoundError(`No similar products found for product: ${productId}`);
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger_1.default.error(
        `Error fetching similar product IDs for product ${productId}: ${errorMessage}`
      );
      throw error;
    }
  }
  async getProductDetail(productId) {
    try {
      logger_1.default.info(`Fetching product details for product: ${productId}`);
      const isKnownSlowProduct = ['1000', '10000'].includes(productId);
      const timeout = isKnownSlowProduct
        ? Math.min(config_1.default.requestTimeout, 2000)
        : config_1.default.requestTimeout;
      const productDetail = await this.productDetailCircuitBreaker.execute(() =>
        this.client.get(`/product/${productId}`, { timeout })
      );
      return productDetail;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Circuit')) {
        logger_1.default.warn(`Circuit breaker prevented request for product details ${productId}`);
        throw new errors_1.NotFoundError(
          `Product details not available due to circuit breaker: ${productId}`
        );
      }
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        logger_1.default.warn(`Product not found: ${productId}`);
        throw new errors_1.NotFoundError(`Product not found: ${productId}`);
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger_1.default.error(`Error fetching product details for ${productId}: ${errorMessage}`);
      throw error;
    }
  }
  clearCache() {
    this.client.clearCache();
    logger_1.default.debug('ProductApiClient cache cleared');
  }
}
exports.default = ProductApiClient;
//# sourceMappingURL=productApiClient.js.map
