import jwt from 'jsonwebtoken';
import { config } from '../config';
export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, config.jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, error: 'Token is invalid or expired' });
            }
            req.user = user;
            next();
        });
    }
    else {
        // Demo bypass mode for local testing if token missing
        req.user = {
            id: 'demo-user-id',
            email: 'demo@financesarthi.in',
            role: 'USER',
        };
        next();
    }
}
