import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { 
  budgetGenerationService, 
  seasonalBudgetService, 
  goalBudgetService, 
  budgetHealthService, 
  scenarioSimulationService 
} from '../services/adaptive-budget-engine';
import { adaptiveBudgetRepository } from '../repositories/adaptive-budget.repository';
import { budgetService } from '../services/budget.service';
import { prisma } from '../config';

export class AdaptiveBudgetController {
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

  getRecommendations = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const salary = user?.monthlyIncome || 75000;

      const currentBudget = await budgetService.getOrCreateCurrentBudget(userId);
      const seasonal = seasonalBudgetService.checkSeasonalAdjustments(currentBudget.month);
      const efStats = await goalBudgetService.evaluateEmergencyFund(userId, salary);

      const recommendations = [];

      if (seasonal.hasSeasonalEvent) {
        recommendations.push({
          id: 'rec-seasonal-adjust',
          summary: seasonal.eventName,
          reason: seasonal.recommendation,
          financialImpact: seasonal.suggestedIncrease || 5000,
          suggestedAction: 'Increase current monthly buffer to account for seasonal spike.',
          priority: 'MEDIUM',
          confidence: 0.9,
        });
      }

      if (!efStats.targetAchieved) {
        recommendations.push({
          id: 'rec-emergency-buffer',
          summary: 'Increase emergency savings',
          reason: efStats.recommendation,
          financialImpact: efStats.suggestedIncrease || 5000,
          suggestedAction: 'Reallocate wants allocations towards safety buffer sweep.',
          priority: 'HIGH',
          confidence: 0.95,
        });
      }

      return this.formatResponse(res, 200, true, 'AI Adaptive recommendations compiled successfully', recommendations);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  approveAction = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { recommendationId, categoryOverrides } = req.body;

      const decision = await adaptiveBudgetRepository.logDecision({
        userId,
        recommendationId,
        action: 'ACCEPTED',
        categoryOverrides: categoryOverrides || {},
      });

      // Log transaction audit trail
      await adaptiveBudgetRepository.logAudit({
        userId,
        decisionId: decision.id,
        type: 'BUDGET_REBALANCE',
        previousState: {},
        newState: categoryOverrides || {},
        financialImpact: 0,
      });

      return this.formatResponse(res, 200, true, 'Recommendation approved and executed successfully', decision);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  dismissAction = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { recommendationId } = req.body;

      const decision = await adaptiveBudgetRepository.logDecision({
        userId,
        recommendationId,
        action: 'DISMISSED',
        categoryOverrides: {},
      });

      return this.formatResponse(res, 200, true, 'Recommendation dismissed successfully', decision);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  runSimulation = async (req: AuthRequest, res: Response) => {
    try {
      const result = scenarioSimulationService.runSimulation(req.body);
      return this.formatResponse(res, 200, true, 'Simulation run calculated successfully', result);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  getHealthScore = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const budget = await budgetService.getOrCreateCurrentBudget(userId);
      
      const emiLoad = 0.25; // Default mock emi ratio
      const health = budgetHealthService.calculateBudgetHealthScore(
        budget.spentAmount,
        budget.totalBudget,
        emiLoad
      );

      return this.formatResponse(res, 200, true, 'Health score calculated successfully', health);
    } catch (err: any) {
      return this.formatResponse(res, 550, false, err.message, null, [err.message]);
    }
  };

  getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const logs = await adaptiveBudgetRepository.getAuditLogs(userId);
      return this.formatResponse(res, 200, true, 'Audit log history retrieved', logs);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
