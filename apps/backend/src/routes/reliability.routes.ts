import { Router } from 'express';
import { reliabilityController } from '../controllers/reliability.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/feedback', authenticateJWT, reliabilityController.submitFeedback);
router.get('/health', authenticateJWT, reliabilityController.getHealthStatus);

export default router;
