import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new BudgetController();

router.get('/', authenticateJWT, controller.getBudgets);
router.get('/current', authenticateJWT, controller.getCurrentBudget);
router.get('/predictions', authenticateJWT, controller.getPredictions);
router.get('/analytics', authenticateJWT, controller.getAnalytics);
router.get('/:id', authenticateJWT, controller.getBudgetById);
router.post('/', authenticateJWT, controller.createBudget);
router.patch('/:id', authenticateJWT, controller.updateBudget);
router.delete('/:id', authenticateJWT, controller.deleteBudget);

export default router;
