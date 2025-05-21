import ProductApiClient from '../clients/productApiClient';
import logger from '../utils/logger';
import { ProductDetail, SimilarProducts } from '../models/productModels';
import { NotFoundError } from '../models/errors';
import config from '../config/config';

const EXTREMELY_SLOW_PRODUCT_IDS = ['10000'];

export default class ProductService {
  private productApiClient: ProductApiClient;
  private readonly MAX_CONCURRENT_REQUESTS: number;

  constructor(apiClient?: ProductApiClient) {
    this.productApiClient = apiClient || new ProductApiClient();
    this.MAX_CONCURRENT_REQUESTS = config.maxConcurrentRequests;
    logger.debug('ProductService initialized');
  }

  async getSimilarProducts(productId: string): Promise<SimilarProducts> {
    try {
      logger.info(`Getting similar products for product: ${productId}`);
      const similarIds = await this.productApiClient.getSimilarProductIds(productId);

      if (!similarIds.length) {
        logger.info(`No similar products found for product: ${productId}`);
        return [];
      }

      const filteredIds = this.filterProblematicProducts(similarIds);

      if (filteredIds.length !== similarIds.length) {
        logger.warn(`Filtered out ${similarIds.length - filteredIds.length} problematic products`);
      }

      logger.debug(`Fetching details for ${filteredIds.length} similar products`);

      const productDetails: Array<ProductDetail | null> = [];

      for (let i = 0; i < filteredIds.length; i += this.MAX_CONCURRENT_REQUESTS) {
        const batchIds = filteredIds.slice(i, i + this.MAX_CONCURRENT_REQUESTS);

        logger.debug(
          `Processing batch ${Math.floor(i / this.MAX_CONCURRENT_REQUESTS) + 1} with ${batchIds.length} products`
        );

        const batchPromises = batchIds.map(id =>
          this.productApiClient.getProductDetail(id).catch(error => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`Failed to get details for product ${id}: ${errorMessage}`);
            return null;
          })
        );

        const batchResults = await Promise.race([
          Promise.all(batchPromises),
          new Promise<null[]>(resolve => {
            setTimeout(() => {
              logger.warn(`Batch timeout exceeded for products ${batchIds.join(', ')}`);
              resolve(batchIds.map(() => null));
            }, config.requestTimeout * 1.5);
          }),
        ]);

        productDetails.push(...batchResults);
      }

      const validProducts = productDetails.filter(
        (product): product is ProductDetail => product !== null
      );

      logger.info(
        `Successfully retrieved ${validProducts.length} of ${filteredIds.length} similar products`
      );

      return validProducts;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        logger.warn(`Product not found or has no similar products: ${productId}`);
        return [];
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error getting similar products for ${productId}: ${errorMessage}`);
      throw error;
    }
  }

  private filterProblematicProducts(productIds: string[]): string[] {
    const problematicIds = productIds.filter(id => EXTREMELY_SLOW_PRODUCT_IDS.includes(id));

    if (problematicIds.length > 0) {
      logger.warn(`Filtered out extremely slow products: ${problematicIds.join(', ')}`);
    }

    return productIds.filter(id => !EXTREMELY_SLOW_PRODUCT_IDS.includes(id));
  }
}
