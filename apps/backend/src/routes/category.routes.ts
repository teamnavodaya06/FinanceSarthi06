import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new CategoryController();

router.get('/', authenticateJWT, controller.getCategories);
router.get('/:id', authenticateJWT, controller.getCategoryById);
router.post('/', authenticateJWT, controller.createCategory);
router.patch('/:id', authenticateJWT, controller.updateCategory);
router.delete('/:id', authenticateJWT, controller.deleteCategory);
router.get('/merchant/:merchantName', authenticateJWT, controller.classifyMerchant);

export default router;
