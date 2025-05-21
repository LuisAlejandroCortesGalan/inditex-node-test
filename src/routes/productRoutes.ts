import { Router } from 'express';
import ProductController from '../controllers/productController';

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * /product/{productId}/similar:
 *   get:
 *     summary: Obtiene productos similares a un producto dado
 *     description: |
 *       Retorna una lista de productos similares al producto especificado por su ID.
 *       Esta ruta está sujeta a rate limiting (50 solicitudes cada 5 minutos por IP).
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto para encontrar similares
 *     responses:
 *       200:
 *         description: Lista de productos similares
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del producto
 *                   name:
 *                     type: string
 *                     description: Nombre del producto
 *                   price:
 *                     type: number
 *                     description: Precio del producto
 *                   availability:
 *                     type: boolean
 *                     description: Disponibilidad del producto
 *       404:
 *         description: Producto no encontrado
 *       429:
 *         description: Demasiadas solicitudes. Por favor, intente más tarde.
 *       500:
 *         description: Error del servidor
 */
router.get('/:productId/similar', productController.getSimilarProducts);

export default router;
