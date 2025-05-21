'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const productApiClient_1 = __importDefault(require('../clients/productApiClient'));
const logger_1 = __importDefault(require('../utils/logger'));
const errors_1 = require('../models/errors');
const config_1 = __importDefault(require('../config/config'));
const EXTREMELY_SLOW_PRODUCT_IDS = ['10000'];
class ProductService {
  constructor(apiClient) {
    this.productApiClient = apiClient || new productApiClient_1.default();
    this.MAX_CONCURRENT_REQUESTS = config_1.default.maxConcurrentRequests;
    logger_1.default.debug('ProductService initialized');
  }
  async getSimilarProducts(productId) {
    try {
      logger_1.default.info(`Getting similar products for product: ${productId}`);
      const similarIds = await this.productApiClient.getSimilarProductIds(productId);
      if (!similarIds.length) {
        logger_1.default.info(`No similar products found for product: ${productId}`);
        return [];
      }
      const filteredIds = this.filterProblematicProducts(similarIds);
      if (filteredIds.length !== similarIds.length) {
        logger_1.default.warn(
          `Filtered out ${similarIds.length - filteredIds.length} problematic products`
        );
      }
      logger_1.default.debug(`Fetching details for ${filteredIds.length} similar products`);
      const productDetails = [];
      for (let i = 0; i < filteredIds.length; i += this.MAX_CONCURRENT_REQUESTS) {
        const batchIds = filteredIds.slice(i, i + this.MAX_CONCURRENT_REQUESTS);
        logger_1.default.debug(
          `Processing batch ${Math.floor(i / this.MAX_CONCURRENT_REQUESTS) + 1} with ${batchIds.length} products`
        );
        const batchPromises = batchIds.map(id =>
          this.productApiClient.getProductDetail(id).catch(error => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.default.warn(`Failed to get details for product ${id}: ${errorMessage}`);
            return null;
          })
        );
        const batchResults = await Promise.race([
          Promise.all(batchPromises),
          new Promise(resolve => {
            setTimeout(() => {
              logger_1.default.warn(`Batch timeout exceeded for products ${batchIds.join(', ')}`);
              resolve(batchIds.map(() => null));
            }, config_1.default.requestTimeout * 1.5);
          }),
        ]);
        productDetails.push(...batchResults);
      }
      const validProducts = productDetails.filter(product => product !== null);
      logger_1.default.info(
        `Successfully retrieved ${validProducts.length} of ${filteredIds.length} similar products`
      );
      return validProducts;
    } catch (error) {
      if (error instanceof errors_1.NotFoundError) {
        logger_1.default.warn(`Product not found or has no similar products: ${productId}`);
        return [];
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger_1.default.error(`Error getting similar products for ${productId}: ${errorMessage}`);
      throw error;
    }
  }
  filterProblematicProducts(productIds) {
    const problematicIds = productIds.filter(id => EXTREMELY_SLOW_PRODUCT_IDS.includes(id));
    if (problematicIds.length > 0) {
      logger_1.default.warn(`Filtered out extremely slow products: ${problematicIds.join(', ')}`);
    }
    return productIds.filter(id => !EXTREMELY_SLOW_PRODUCT_IDS.includes(id));
  }
}
exports.default = ProductService;
//# sourceMappingURL=productService.js.map
