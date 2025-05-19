"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productApiClient_1 = __importDefault(require("../clients/productApiClient"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../models/errors");
class ProductService {
    constructor(apiClient) {
        this.productApiClient = apiClient || new productApiClient_1.default();
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
            logger_1.default.debug(`Fetching details for ${similarIds.length} similar products`);
            const productDetailsPromises = similarIds.map(id => this.productApiClient.getProductDetail(id)
                .catch(error => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger_1.default.warn(`Failed to get details for product ${id}: ${errorMessage}`);
                return null;
            }));
            const productDetails = await Promise.all(productDetailsPromises);
            const validProducts = productDetails.filter((product) => product !== null);
            logger_1.default.info(`Successfully retrieved ${validProducts.length} of ${similarIds.length} similar products`);
            return validProducts;
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`Product not found or has no similar products: ${productId}`);
                return [];
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.default.error(`Error getting similar products for ${productId}: ${errorMessage}`);
            throw error;
        }
    }
}
exports.default = ProductService;
//# sourceMappingURL=productService.js.map