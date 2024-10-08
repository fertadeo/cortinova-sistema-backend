import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
};
