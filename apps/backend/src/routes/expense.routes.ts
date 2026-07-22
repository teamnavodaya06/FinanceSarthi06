import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new ExpenseController();

router.get('/', authenticateJWT, controller.getExpenses);
router.post('/', authenticateJWT, controller.createExpense);

export default router;
