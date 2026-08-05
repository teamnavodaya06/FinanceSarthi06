import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dashboardAggregationService } from '../services/dashboard-aggregation.service';

export class DashboardController {
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

  getDashboard = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const aggregated = await dashboardAggregationService.getAggregatedDashboard(userId);
      return this.formatResponse(res, 200, true, 'Aggregated dashboard data compiled successfully', aggregated);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getSummary = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const aggregated = await dashboardAggregationService.getAggregatedDashboard(userId);
      return this.formatResponse(res, 200, true, 'Dashboard summary metrics retrieved successfully', aggregated.summary);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getCharts = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const aggregated = await dashboardAggregationService.getAggregatedDashboard(userId);
      return this.formatResponse(res, 200, true, 'Dashboard chart datasets compiled successfully', aggregated.charts);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getInsights = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const aggregated = await dashboardAggregationService.getAggregatedDashboard(userId);
      return this.formatResponse(res, 200, true, 'Dashboard notifications and insights compiled', aggregated.notifications);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getFinancialHealth = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const aggregated = await dashboardAggregationService.getAggregatedDashboard(userId);
      return this.formatResponse(res, 200, true, 'Dashboard financial health profile compiled', aggregated.financialHealth);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getRecommendations = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const aggregated = await dashboardAggregationService.getAggregatedDashboard(userId);
      return this.formatResponse(res, 200, true, 'Dashboard AI recommendations suggestions compiled', aggregated.recommendations);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getStory = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const aggregated = await dashboardAggregationService.getAggregatedDashboard(userId);
      return this.formatResponse(res, 200, true, 'Dashboard Monthly Financial Story compiled successfully', aggregated.monthlyStory);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
