import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ProductService from '../services/productService';
import asyncHandler from '../utils/asyncHandler';
import logger from '../utils/logger';

export default class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Obtiene productos similares para un producto dado
   */
  getSimilarProducts = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    
    logger.info(`Request for similar products for productId: ${productId}`);
    
    const similarProducts = await this.productService.getSimilarProducts(productId);
    
    return res.status(StatusCodes.OK).json(similarProducts);
  });
}