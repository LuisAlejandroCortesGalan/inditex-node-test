export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  availability: boolean;
}
export type SimilarProductIds = string[];
export type SimilarProducts = ProductDetail[];
export interface ApiError {
  status: string;
  message: string;
  code?: number;
  details?: unknown;
}
export interface ApiResponse<T> {
  status: string;
  data: T;
}
