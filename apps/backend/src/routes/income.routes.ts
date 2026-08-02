import { Router } from 'express';
import { IncomeController } from '../controllers/income.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new IncomeController();

router.post('/', authenticateJWT, controller.createIncome);
router.get('/', authenticateJWT, controller.getIncome);
router.get('/summary', authenticateJWT, controller.getSummary);
router.get('/:id', authenticateJWT, controller.getIncomeById);
router.put('/:id', authenticateJWT, controller.replaceIncome);
router.patch('/:id', authenticateJWT, controller.updateIncome);
router.delete('/:id', authenticateJWT, controller.deleteIncome);

export default router;
