import { Router } from 'express';
import { CopilotController } from '../controllers/copilot.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new CopilotController();

router.get('/conversations', authenticateJWT, controller.getConversations);
router.post('/conversations', authenticateJWT, controller.createConversation);
router.delete('/conversations/:id', authenticateJWT, controller.deleteConversation);
router.post('/conversations/:id/pin', authenticateJWT, controller.pinConversation);

// SSE Streaming Route
router.get('/stream', authenticateJWT, controller.chatStream);

export default router;
