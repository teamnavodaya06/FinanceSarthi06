import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { budgetService, budgetPredictionService, budgetRecommendationService } from '../services/budget.service';

export class BudgetController {
  private formatResponse(res: Response, statusCode: number, success: boolean, message: string, data: any = null, errors: any[] = []) {
    const timestamp = new Date().toISOString();
    return res.status(statusCode).json({
      success,
      message,
      data,
      errors,
      timestamp,
    });
  }

  getCurrentBudget = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const budget = await budgetService.getOrCreateCurrentBudget(userId);
      // Sync it with latest expenses
      const synced = await budgetService.syncBudgetWithExpenses(userId, budget.month, budget.year);
      return this.formatResponse(res, 200, true, 'Current budget retrieved successfully', synced || budget);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  createBudget = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const budget = await budgetService.createBudget(userId, req.body);
      return this.formatResponse(res, 201, true, 'Budget created successfully', budget);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  getBudgets = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const budgets = await budgetService.getHistoricalBudgets(userId);
      return this.formatResponse(res, 200, true, 'Historical budgets retrieved successfully', budgets);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getBudgetById = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const budget = await budgetService.updateBudget(id, userId, {}); // Ownership check
      return this.formatResponse(res, 200, true, 'Budget retrieved successfully', budget);
    } catch (err: any) {
      return this.formatResponse(res, 404, false, err.message, null, [err.message]);
    }
  };

  updateBudget = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const budget = await budgetService.updateBudget(id, userId, req.body);
      return this.formatResponse(res, 200, true, 'Budget updated successfully', budget);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  deleteBudget = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      await budgetService.deleteBudget(id, userId);
      return this.formatResponse(res, 200, true, 'Budget deleted successfully');
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  getPredictions = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const budget = await budgetService.getOrCreateCurrentBudget(userId);
      const predictions = budgetPredictionService.getPredictions(
        budget.spentAmount,
        budget.totalBudget,
        budget.month,
        budget.year
      );
      return this.formatResponse(res, 200, true, 'Budget predictions calculated successfully', predictions);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const budget = await budgetService.getOrCreateCurrentBudget(userId);
      const recs = budgetRecommendationService.generateRecommendations(
        budget.spentAmount,
        budget.totalBudget,
        budget.categoryBudgets
      );
      return this.formatResponse(res, 200, true, 'Budget recommendations calculated successfully', recs);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
