"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpClient_1 = __importDefault(require("../utils/httpClient"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../models/errors");
class ProductApiClient {
    constructor(baseURL = config_1.default.externalApiBaseUrl) {
        this.client = new httpClient_1.default(baseURL);
        logger_1.default.debug(`ProductApiClient initialized with baseURL: ${baseURL}`);
    }
    async getSimilarProductIds(productId) {
        try {
            logger_1.default.info(`Fetching similar product IDs for product: ${productId}`);
            const similarIds = await this.client.get(`/product/${productId}/similarids`);
            logger_1.default.debug(`Found ${similarIds.length} similar products for product ${productId}`);
            return similarIds;
        }
        catch (error) {
            if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
                logger_1.default.warn(`No similar products found for product: ${productId}`);
                throw new errors_1.NotFoundError(`No similar products found for product: ${productId}`);
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.default.error(`Error fetching similar product IDs for product ${productId}: ${errorMessage}`);
            throw error;
        }
    }
    async getProductDetail(productId) {
        try {
            logger_1.default.info(`Fetching product details for product: ${productId}`);
            const productDetail = await this.client.get(`/product/${productId}`);
            return productDetail;
        }
        catch (error) {
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