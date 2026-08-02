import { Router } from 'express';
import { IncomeController } from '../controllers/income.controller';
import { authenticateJWT } from '../middleware/auth';
import { validateIncomeBody } from '../middleware/validation.middleware';

const router = Router();
const controller = new IncomeController();

router.post('/', authenticateJWT, validateIncomeBody, controller.createIncome);
router.get('/', authenticateJWT, controller.getIncome);
router.get('/summary', authenticateJWT, controller.getSummary);
router.get('/:id', authenticateJWT, controller.getIncomeById);
router.put('/:id', authenticateJWT, validateIncomeBody, controller.replaceIncome);
router.patch('/:id', authenticateJWT, validateIncomeBody, controller.updateIncome);
router.delete('/:id', authenticateJWT, controller.deleteIncome);

export default router;
