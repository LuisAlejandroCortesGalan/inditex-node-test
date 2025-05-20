import ProductApiClient from '../clients/productApiClient';
import logger from '../utils/logger';
import { ProductDetail, SimilarProducts } from '../models/productModels';
import { NotFoundError } from '../models/errors';
import config from '../config/config';

/**
 * Lista de IDs de productos conocidos por ser extremadamente lentos
 */
const EXTREMELY_SLOW_PRODUCT_IDS = ['10000'];

/**
 * Servicio para operaciones relacionadas con productos
 */
export default class ProductService {
    private productApiClient: ProductApiClient;
    private readonly MAX_CONCURRENT_REQUESTS: number;

    /**
     * Constructor del servicio de productos
     * @param apiClient Cliente opcional de API de productos (útil para testing)
     */
    constructor(apiClient?: ProductApiClient) {
        this.productApiClient = apiClient || new ProductApiClient();
        this.MAX_CONCURRENT_REQUESTS = config.maxConcurrentRequests;
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

            // Filtrar productos extremadamente lentos
            const filteredIds = this.filterProblematicProducts(similarIds);
            
            if (filteredIds.length !== similarIds.length) {
                logger.warn(`Filtered out ${similarIds.length - filteredIds.length} problematic products`);
            }

            logger.debug(`Fetching details for ${filteredIds.length} similar products`);

            // Array para almacenar todos los detalles de productos
            const productDetails: Array<ProductDetail | null> = [];

            // Procesar en lotes para controlar la concurrencia
            for (let i = 0; i < filteredIds.length; i += this.MAX_CONCURRENT_REQUESTS) {
                const batchIds = filteredIds.slice(i, i + this.MAX_CONCURRENT_REQUESTS);
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

                // Establecer un timeout global para todo el lote
                const batchResults = await Promise.race([
                    Promise.all(batchPromises),
                    new Promise<null[]>((resolve) => {
                        setTimeout(() => {
                            logger.warn(`Batch timeout exceeded for products ${batchIds.join(', ')}`);
                            resolve(batchIds.map(() => null));
                        }, config.requestTimeout * 1.5); // 50% más de tiempo que el timeout estándar
                    })
                ]);
                
                // Añadir los resultados al array principal
                productDetails.push(...batchResults);
            }

            // Filtrar productos nulos (los que fallaron)
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

            // Manejar el mensaje de error de forma segura
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error getting similar products for ${productId}: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Filtra productos conocidos por ser problemáticos
     * @param productIds Lista de IDs de productos a filtrar
     * @returns Lista filtrada de IDs de productos
     */
    private filterProblematicProducts(productIds: string[]): string[] {
        const problematicIds = productIds.filter(id => 
            EXTREMELY_SLOW_PRODUCT_IDS.includes(id)
        );
        
        if (problematicIds.length > 0) {
            logger.warn(`Filtered out extremely slow products: ${problematicIds.join(', ')}`);
        }
        
        return productIds.filter(id => !EXTREMELY_SLOW_PRODUCT_IDS.includes(id));
    }
}