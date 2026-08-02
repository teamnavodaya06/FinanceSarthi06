import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const router = Router();

router.post('/token', (req, res) => {
  try {
    const { uid, email } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: 'Firebase UID is required' });
    }
    const token = jwt.sign(
      { id: uid, email: email || '', role: 'USER' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    return res.json({
      success: true,
      message: 'Token generated successfully',
      data: { token },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
