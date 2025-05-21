import { Request, Response, NextFunction } from 'express';
declare module 'http' {
  interface OutgoingMessage {
    __responseStartTime?: number;
  }
}
export declare const requestIdMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
