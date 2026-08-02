import { Router } from 'express';
import expenseRoutes from './expense.routes';
import authRoutes from './auth.routes';
import incomeRoutes from './income.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FinanceSarthi Express API', version: '1.0.0' });
});

router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/income', incomeRoutes);

export default router;
