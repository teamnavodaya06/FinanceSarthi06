import { Router } from 'express';
import { AdaptiveBudgetController } from '../controllers/adaptive-budget.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new AdaptiveBudgetController();

router.get('/recommendations', authenticateJWT, controller.getRecommendations);
router.post('/approve', authenticateJWT, controller.approveAction);
router.post('/dismiss', authenticateJWT, controller.dismissAction);
router.post('/simulate', authenticateJWT, controller.runSimulation);
router.get('/health', authenticateJWT, controller.getHealthScore);
router.get('/audit', authenticateJWT, controller.getAuditLogs);

export default router;
