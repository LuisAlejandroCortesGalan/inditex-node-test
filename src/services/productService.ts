import ProductApiClient from '../clients/productApiClient';
import logger from '../utils/logger';
import { ProductDetail, SimilarProducts } from '../models/productModels';
import { NotFoundError } from '../models/errors';

/**
 * Servicio para operaciones relacionadas con productos
 */
export default class ProductService {
    private productApiClient: ProductApiClient;
    private readonly MAX_CONCURRENT_REQUESTS = parseInt(
        process.env.MAX_CONCURRENT_REQUESTS || '10',
        10
    );
    /**
     * Constructor del servicio de productos
     * @param apiClient Cliente opcional de API de productos (útil para testing)
     */
    constructor(apiClient?: ProductApiClient) {
        this.productApiClient = apiClient || new ProductApiClient();
        logger.debug('ProductService initialized');
    }

    /**
     * Obtiene productos similares para un producto dado
     * @param productId ID del producto para buscar similares
     * @returns Array con los detalles de los productos similares
     */
    async getSimilarProducts(productId: string): Promise<SimilarProducts> {
        try {
            logger.info(`Getting similar products for product: ${productId}`);

            // Obtener IDs de productos similares
            const similarIds = await this.productApiClient.getSimilarProductIds(productId);

            if (!similarIds.length) {
                logger.info(`No similar products found for product: ${productId}`);
                return [];
            }

            logger.debug(`Fetching details for ${similarIds.length} similar products`);

            // Array para almacenar todos los detalles de productos
            const productDetails: Array<ProductDetail | null> = [];

            // Procesar en lotes para controlar la concurrencia
            for (let i = 0; i < similarIds.length; i += this.MAX_CONCURRENT_REQUESTS) {
                const batchIds = similarIds.slice(i, i + this.MAX_CONCURRENT_REQUESTS);
                logger.debug(`Processing batch ${Math.floor(i / this.MAX_CONCURRENT_REQUESTS) + 1} with ${batchIds.length} products`);

                // Crear un array de promesas para este lote
                const batchPromises = batchIds.map(id =>
                    this.productApiClient.getProductDetail(id)
                        .catch(error => {
                            // Manejar error de forma segura
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            logger.warn(`Failed to get details for product ${id}: ${errorMessage}`);
                            // Retornar null para productos que no se pudieron obtener
                            return null;
                        })
                );

                // Esperar a que se completen las promesas del lote actual
                const batchResults = await Promise.all(batchPromises);

                // Añadir los resultados al array principal
                productDetails.push(...batchResults);
            }

            // Filtrar productos nulos (los que fallaron)
            const validProducts = productDetails.filter(
                (product): product is ProductDetail => product !== null
            );

            logger.info(
                `Successfully retrieved ${validProducts.length} of ${similarIds.length} similar products`
            );

            return validProducts;
        } catch (error: unknown) {
            if (error instanceof NotFoundError) {
                logger.warn(`Product not found or has no similar products: ${productId}`);
                return [];
            }

            // Manejar el mensaje de error de forma segura
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error getting similar products for ${productId}: ${errorMessage}`);
            throw error;
        }
    }
}