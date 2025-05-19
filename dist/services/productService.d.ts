import ProductApiClient from '../clients/productApiClient';
import { SimilarProducts } from '../models/productModels';
export default class ProductService {
    private productApiClient;
    constructor(apiClient?: ProductApiClient);
    getSimilarProducts(productId: string): Promise<SimilarProducts>;
}
