/**
 * Interfaz que define la estructura de los detalles de un producto
 */
export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  availability: boolean;
}

/**
 * Tipo que define un array de IDs de productos similares
 */
export type SimilarProductIds = string[];

/**
 * Tipo que define un array de detalles de productos similares
 */
export type SimilarProducts = ProductDetail[];

/**
 * Interfaz para respuestas de error de la API
 */
export interface ApiError {
  status: string;
  message: string;
  code?: number;
  details?: unknown;
}

/**
 * Interfaz para respuestas exitosas de la API
 */
export interface ApiResponse<T> {
  status: string;
  data: T;
}