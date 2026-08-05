import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config, prisma } from '../config';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/token', async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: 'Firebase UID is required' });
    }

    const name = displayName || email?.split('@')[0] || 'FinanceSarthi User';

    // Persist Google Authenticated User inside SaaS Postgres Table
    try {
      await prisma.user.upsert({
        where: { id: uid },
        update: {
          email: email || '',
          name,
        },
        create: {
          id: uid,
          email: email || '',
          name,
          monthlyIncome: 75000,
          cityTier: 'TIER_2',
        }
      });
    } catch (dbErr: any) {
      console.warn(`[DATABASE OFFLINE WARNING] Could not upsert user inside Postgres: ${dbErr.message}. Continuing token generation for offline fallback.`);
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

router.delete('/delete-account', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Cascades delete User and all related tables in Postgres
    await prisma.user.delete({ where: { id: userId } });

    return res.json({
      success: true,
      message: 'User account and all related database entries successfully wiped.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
