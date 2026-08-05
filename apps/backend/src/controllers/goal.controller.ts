import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { goalExtendedRepository } from '../repositories/goal-extended.repository';
import { goalForecastService } from '../services/goals/GoalForecastService';
import { goalAnalyticsService } from '../services/goals/GoalAnalyticsService';
import { goalProgressService } from '../services/goals/GoalProgressService';
import { goalHealthService } from '../services/goals/GoalHealthService';
import { goalMilestoneService } from '../services/goals/GoalMilestoneService';

export class GoalController {
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

  createGoal = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const goal = await goalExtendedRepository.create(userId, req.body);
      return this.formatResponse(res, 201, true, 'Goal created successfully', goal);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getGoals = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const goals = await goalExtendedRepository.findAll(userId);
      return this.formatResponse(res, 200, true, 'Goals fetched successfully', goals);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getGoalById = async (req: AuthRequest, res: Response) => {
    try {
      const goal = await goalExtendedRepository.findById(req.params.id);
      if (!goal) {
        return this.formatResponse(res, 404, false, 'Goal not found');
      }
      return this.formatResponse(res, 200, true, 'Goal fetched successfully', goal);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  updateGoal = async (req: AuthRequest, res: Response) => {
    try {
      const goal = await goalExtendedRepository.update(req.params.id, req.body);
      return this.formatResponse(res, 200, true, 'Goal updated successfully', goal);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  deleteGoal = async (req: AuthRequest, res: Response) => {
    try {
      await goalExtendedRepository.softDelete(req.params.id);
      return this.formatResponse(res, 200, true, 'Goal deleted successfully');
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  addContribution = async (req: AuthRequest, res: Response) => {
    try {
      const { amount, type } = req.body;
      if (!amount) {
        return this.formatResponse(res, 400, false, 'Invalid parameters: amount is required');
      }
      const contrib = await goalExtendedRepository.addContribution(req.params.id, amount, type || 'MANUAL');
      return this.formatResponse(res, 200, true, 'Goal contribution logged successfully', contrib);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getHistory = async (req: AuthRequest, res: Response) => {
    try {
      const history = await goalExtendedRepository.getContributionsHistory(req.params.id);
      return this.formatResponse(res, 200, true, 'Contributions history fetched successfully', history);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const analytics = await goalAnalyticsService.getAnalytics(userId);
      return this.formatResponse(res, 200, true, 'Goals analytics compiled successfully', analytics);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getForecast = async (req: AuthRequest, res: Response) => {
    try {
      const forecast = await goalForecastService.getForecastForGoal(req.params.id);
      if (!forecast) {
        return this.formatResponse(res, 404, false, 'Goal not found');
      }
      return this.formatResponse(res, 200, true, 'Goal forecast compiled successfully', forecast);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  simulateDoubleContribution = async (req: AuthRequest, res: Response) => {
    try {
      const simulation = await goalForecastService.simulateDoubleContribution(req.params.id);
      if (!simulation) {
        return this.formatResponse(res, 404, false, 'Goal not found');
      }
      return this.formatResponse(res, 200, true, 'Simulation run successfully', simulation);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getProgress = async (req: AuthRequest, res: Response) => {
    try {
      const progress = await goalProgressService.getProgressForGoal(req.params.id);
      if (!progress) {
        return this.formatResponse(res, 404, false, 'Goal not found');
      }
      return this.formatResponse(res, 200, true, 'Goal progress compiled successfully', progress);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getHealth = async (req: AuthRequest, res: Response) => {
    try {
      const health = await goalHealthService.getHealthForGoal(req.params.id);
      if (!health) {
        return this.formatResponse(res, 404, false, 'Goal not found');
      }
      return this.formatResponse(res, 200, true, 'Goal health compiled successfully', health);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getMilestones = async (req: AuthRequest, res: Response) => {
    try {
      const milestones = await goalMilestoneService.getMilestonesForGoal(req.params.id);
      return this.formatResponse(res, 200, true, 'Goal milestones compiled successfully', milestones);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
export const goalController = new GoalController();
