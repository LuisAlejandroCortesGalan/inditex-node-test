import { Request, Response, NextFunction } from 'express';

/**
 * Envuelve funciones asíncronas de controladores para manejo de errores automatizado
 * @param fn Función controladora asíncrona
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;