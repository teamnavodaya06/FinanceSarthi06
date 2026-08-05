import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { promptRecommendationEngine } from '../services/prompts/PromptRecommendationEngine';

export class SuggestedPromptsController {
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

  getSuggestions = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const suggestions = await promptRecommendationEngine.getPersonalizedSuggestions(userId);
      return this.formatResponse(res, 200, true, 'Suggested prompts compiled successfully', suggestions);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
export const suggestedPromptsController = new SuggestedPromptsController();
