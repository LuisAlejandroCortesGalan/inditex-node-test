import { ProductDetail, SimilarProductIds } from '../models/productModels';
export default class ProductApiClient {
    private client;
    constructor(baseURL?: string);
    getSimilarProductIds(productId: string): Promise<SimilarProductIds>;
    getProductDetail(productId: string): Promise<ProductDetail>;
    clearCache(): void;
}
