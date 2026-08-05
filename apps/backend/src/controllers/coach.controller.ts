import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiGoalCoachService } from '../services/goals/AIGoalCoachService';

export class CoachController {
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
      const cards = await aiGoalCoachService.getRecommendations(userId);
      return this.formatResponse(res, 200, true, 'AI Coach recommendations compiled successfully', cards);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  executeAction = async (req: AuthRequest, res: Response) => {
    try {
      const { action } = req.body; // 'APPROVE' | 'DISMISS'
      if (!action) {
        return this.formatResponse(res, 400, false, 'Invalid parameters: action is required.');
      }
      const success = await aiGoalCoachService.executeAction(req.params.id, action);
      if (!success) {
        return this.formatResponse(res, 404, false, 'Recommendation not found');
      }
      return this.formatResponse(res, 200, true, 'AI Coach decision logged successfully');
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
export const coachController = new CoachController();
