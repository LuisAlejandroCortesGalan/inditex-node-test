import HttpClient from '../utils/httpClient';
import config from '../config/config';
import logger from '../utils/logger';
import { ProductDetail, SimilarProductIds } from '../models/productModels';
import { NotFoundError } from '../models/errors';

/**
 * Cliente para interactuar con la API externa de productos
 */
export default class ProductApiClient {
    private client: HttpClient;

    /**
     * Constructor del cliente de API de productos
     * @param baseURL URL base opcional para la API (por defecto usa la configuración)
     */
    constructor(baseURL = config.externalApiBaseUrl) {
        this.client = new HttpClient(baseURL);
        logger.debug(`ProductApiClient initialized with baseURL: ${baseURL}`);
    }

    /**
     * Obtiene IDs de productos similares para un producto dado
     * @param productId ID del producto para buscar similares
     * @returns Array de IDs de productos similares
     */
    async getSimilarProductIds(productId: string): Promise<SimilarProductIds> {
        try {
            logger.info(`Fetching similar product IDs for product: ${productId}`);
            const similarIds = await this.client.get<SimilarProductIds>(`/product/${productId}/similarids`);
            logger.debug(`Found ${similarIds.length} similar products for product ${productId}`);
            return similarIds;
        } catch (error: unknown) {
            // Comprobar si el error tiene la propiedad statusCode
            if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
                logger.warn(`No similar products found for product: ${productId}`);
                throw new NotFoundError(`No similar products found for product: ${productId}`);
            }

            // Manejar el mensaje de error de forma segura
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error fetching similar product IDs for product ${productId}: ${errorMessage}`);
            throw error;
        }
    }

    async getProductDetail(productId: string): Promise<ProductDetail> {
        try {
            logger.info(`Fetching product details for product: ${productId}`);
            const productDetail = await this.client.get<ProductDetail>(`/product/${productId}`);
            return productDetail;
        } catch (error: unknown) {
            // Comprobar si el error tiene la propiedad statusCode
            if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
                logger.warn(`Product not found: ${productId}`);
                throw new NotFoundError(`Product not found: ${productId}`);
            }

            // Manejar el mensaje de error de forma segura
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error fetching product details for ${productId}: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Limpia la caché del cliente
     */
    clearCache(): void {
        this.client.clearCache();
        logger.debug('ProductApiClient cache cleared');
    }
}