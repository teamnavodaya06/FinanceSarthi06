import { Router } from 'express';
import { suggestedPromptsController } from '../controllers/suggested-prompts.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/suggestions', authenticateJWT, suggestedPromptsController.getSuggestions);

export default router;
