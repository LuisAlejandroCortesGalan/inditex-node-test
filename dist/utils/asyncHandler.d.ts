import { Request, Response, NextFunction } from 'express';
declare const asyncHandler: <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => (req: Request, res: Response, next: NextFunction) => void;
export default asyncHandler;
