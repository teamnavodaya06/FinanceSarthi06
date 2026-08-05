import { Router } from 'express';
import { goalController } from '../controllers/goal.controller';
import { coachController } from '../controllers/coach.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.post('/', goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/analytics', goalController.getAnalytics);
router.get('/coach/recommendations', coachController.getRecommendations);
router.post('/coach/recommendations/:id/action', coachController.executeAction);
router.get('/forecast/:id', goalController.getForecast);
router.post('/simulate/:id', goalController.simulateDoubleContribution);
router.get('/:id/progress', goalController.getProgress);
router.get('/:id/health', goalController.getHealth);
router.get('/:id/milestones', goalController.getMilestones);
router.get('/:id', goalController.getGoalById);
router.patch('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/:id/contributions', goalController.addContribution);
router.get('/:id/history', goalController.getHistory);

export default router;
