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

  if (token) {
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, error: 'Token is invalid or expired' });
      }

      req.user = user as any;
      next();
    });
  } else {
    return res.status(401).json({ success: false, error: 'Authentication token is required' });
  }
}
