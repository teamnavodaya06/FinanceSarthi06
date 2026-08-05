import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new DashboardController();

// Specialized financial data platform endpoints
router.get('/', authenticateJWT, controller.getDashboard);
router.get('/summary', authenticateJWT, controller.getSummary);
router.get('/charts', authenticateJWT, controller.getCharts);
router.get('/insights', authenticateJWT, controller.getInsights);
router.get('/financial-health', authenticateJWT, controller.getFinancialHealth);
router.get('/recommendations', authenticateJWT, controller.getRecommendations);
router.get('/story', authenticateJWT, controller.getStory);

export default router;
