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

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, error: 'Token is invalid or expired' });
      }

      req.user = user as any;
      next();
    });
  } else {
    // Demo bypass mode for local testing if token missing
    req.user = {
      id: 'demo-user-id',
      email: 'demo@financesarthi.in',
      role: 'USER',
    };
    next();
  }
}
