/// <reference types="qs" />
import { Request, Response } from 'express';
export default class ProductController {
  private productService;
  constructor();
  getSimilarProducts: (
    req: Request<
      import('express-serve-static-core').ParamsDictionary,
      any,
      any,
      import('qs').ParsedQs,
      Record<string, any>
    >,
    res: Response<any, Record<string, any>>,
    next: import('express').NextFunction
  ) => void;
}
