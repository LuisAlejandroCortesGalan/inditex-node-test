// src/controllers/productController.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ProductService from '../services/productService';
import asyncHandler from '../utils/asyncHandler';

export default class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getSimilarProducts = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;

    const similarProducts = await this.productService.getSimilarProducts(productId);

    return res.status(StatusCodes.OK).json(similarProducts);
  });
}
