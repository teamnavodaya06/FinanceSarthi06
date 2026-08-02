import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new ExpenseController();

router.get('/', authenticateJWT, controller.getExpenses);
router.post('/', authenticateJWT, controller.createExpense);
router.get('/:id', authenticateJWT, controller.getExpenseById);
router.patch('/:id', authenticateJWT, controller.updateExpense);
router.delete('/:id', authenticateJWT, controller.deleteExpense);

export default router;
