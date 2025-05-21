import { Request, Response, NextFunction } from 'express';
export declare const notFoundHandler: (req: Request, _res: Response, next: NextFunction) => void;
export declare const errorHandler: (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => void;
