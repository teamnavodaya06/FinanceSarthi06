import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { IncomeService } from '../services/income.service';
import { ZodError } from 'zod';

export class IncomeController {
  private incomeService = new IncomeService();

  private formatResponse(res: Response, statusCode: number, success: boolean, message: string, data: any = null, errors: any[] = []) {
    const timestamp = new Date().toISOString();
    if (success) {
      return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp,
      });
    } else {
      return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp,
      });
    }
  }

  createIncome = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const userEmail = req.user?.email || 'demo@financesarthi.in';
      const result = await this.incomeService.createIncome(userId, userEmail, req.body);
      return this.formatResponse(res, 201, true, 'Income created successfully', result);
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errorMsgs = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return this.formatResponse(res, 400, false, 'Validation failed', null, errorMsgs);
      }
      return this.formatResponse(res, 400, false, err.message, null, []);
    }
  };

  getIncome = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const result = await this.incomeService.getActiveIncome(userId);
      if (!result) {
        return this.formatResponse(res, 200, true, 'No active income profile found for user', null);
      }
      return this.formatResponse(res, 200, true, 'Active income profile retrieved successfully', result);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, []);
    }
  };

  getIncomeById = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const result = await this.incomeService.getIncomeById(id, userId);
      return this.formatResponse(res, 200, true, 'Income record retrieved successfully', result);
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 404;
      return this.formatResponse(res, statusCode, false, err.message, null, []);
    }
  };

  replaceIncome = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const result = await this.incomeService.updateIncome(id, userId, req.body, true);
      return this.formatResponse(res, 200, true, 'Income record replaced successfully', result);
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errorMsgs = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return this.formatResponse(res, 400, false, 'Validation failed', null, errorMsgs);
      }
      const statusCode = err.message.includes('Access denied') ? 403 : 400;
      return this.formatResponse(res, statusCode, false, err.message, null, []);
    }
  };

  updateIncome = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const result = await this.incomeService.updateIncome(id, userId, req.body, false);
      return this.formatResponse(res, 200, true, 'Income record updated successfully', result);
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errorMsgs = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return this.formatResponse(res, 400, false, 'Validation failed', null, errorMsgs);
      }
      const statusCode = err.message.includes('Access denied') ? 403 : 400;
      return this.formatResponse(res, statusCode, false, err.message, null, []);
    }
  };

  deleteIncome = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      await this.incomeService.softDeleteIncome(id, userId);
      return this.formatResponse(res, 200, true, 'Income record soft deleted successfully', null);
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 400;
      return this.formatResponse(res, statusCode, false, err.message, null, []);
    }
  };

  getSummary = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const result = await this.incomeService.getSummary(userId);
      return this.formatResponse(res, 200, true, 'Income calculations summary generated successfully', result);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, []);
    }
  };
}
