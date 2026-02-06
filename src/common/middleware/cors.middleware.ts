import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigins = [
      'https://shopsureweb.vercel.app',
      'http://localhost:3000',
    ];

    const origin = req.headers.origin;
    
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept, Origin, X-Requested-With'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  }
}