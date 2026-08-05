import { Router } from 'express';
import expenseRoutes from './expense.routes';
import authRoutes from './auth.routes';
import incomeRoutes from './income.routes';
import categoryRoutes from './category.routes';
import taxonomyRoutes from './taxonomy.routes';
import budgetRoutes from './budget.routes';
import adaptiveBudgetRoutes from './adaptive-budget.routes';
import dashboardRoutes from './dashboard.routes';
import copilotRoutes from './copilot.routes';
import suggestedPromptsRoutes from './suggested-prompts.routes';
import reliabilityRoutes from './reliability.routes';
import goalIntelligenceRoutes from './goal-intelligence.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FinanceSarthi Express API', version: '1.0.0' });
});

router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/income', incomeRoutes);
router.use('/expense-categories', categoryRoutes);
router.use('/taxonomy', taxonomyRoutes);
router.use('/budgets', budgetRoutes);
router.use('/adaptive-budget', adaptiveBudgetRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/copilot', copilotRoutes);
router.use('/prompts', suggestedPromptsRoutes);
router.use('/reliability', reliabilityRoutes);
router.use('/goals', goalIntelligenceRoutes);

export default router;
