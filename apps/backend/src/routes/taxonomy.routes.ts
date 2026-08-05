import { Router } from 'express';
import { TaxonomyController } from '../controllers/taxonomy.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new TaxonomyController();

router.get('/', authenticateJWT, controller.getNodes);
router.get('/:id', authenticateJWT, controller.getNodeById);
router.post('/', authenticateJWT, controller.createNode);
router.patch('/:id', authenticateJWT, controller.updateNode);
router.delete('/:id', authenticateJWT, controller.deleteNode);
router.get('/merchant/:merchantName', authenticateJWT, controller.classifyMerchant);

export default router;
