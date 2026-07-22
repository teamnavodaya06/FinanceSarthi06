import { Router } from 'express';
import expenseRoutes from './expense.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FinanceSarthi Express API', version: '1.0.0' });
});

router.use('/expenses', expenseRoutes);

export default router;
