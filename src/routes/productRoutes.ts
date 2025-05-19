import { Router } from 'express';
import ProductController from '../controllers/productController';

const router = Router();
const productController = new ProductController();

/**
 * @route GET /product/:productId/similar
 * @desc Obtiene productos similares para un ID de producto
 */
router.get('/:productId/similar', productController.getSimilarProducts);

export default router;