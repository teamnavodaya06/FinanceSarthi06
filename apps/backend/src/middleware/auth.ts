import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : queryToken;

  if (token && token !== 'null' && token !== 'undefined') {
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        // Fallback to demo user on invalid token during development
        req.user = { id: 'demo-user-id', email: 'demo@financesarthi.ai', role: 'USER' };
        return next();
      }

      req.user = user as any;
      next();
    });
  } else {
    // Default to demo user context for unauthenticated workspace exploration
    req.user = { id: 'demo-user-id', email: 'demo@financesarthi.ai', role: 'USER' };
    next();
  }
}
