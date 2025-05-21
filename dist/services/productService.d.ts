import ProductApiClient from '../clients/productApiClient';
import { SimilarProducts } from '../models/productModels';
export default class ProductService {
  private productApiClient;
  private readonly MAX_CONCURRENT_REQUESTS;
  constructor(apiClient?: ProductApiClient);
  getSimilarProducts(productId: string): Promise<SimilarProducts>;
  private filterProblematicProducts;
}
