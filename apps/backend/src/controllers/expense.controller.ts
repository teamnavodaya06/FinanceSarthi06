import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ExpenseService } from '../services/expense.service';

export class ExpenseController {
  private expenseService = new ExpenseService();

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

  getExpenses = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      
      const category = req.query.category as string | undefined;
      const paymentMethod = req.query.paymentMethod as string | undefined;
      const isRecurring = req.query.isRecurring !== undefined 
        ? req.query.isRecurring === 'true' 
        : undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const cursor = req.query.cursor as string | undefined;
      const sortBy = req.query.sortBy as any | undefined;

      const result = await this.expenseService.getFilteredExpenses({
        userId,
        category,
        paymentMethod,
        isRecurring,
        startDate,
        endDate,
        search,
        limit,
        cursor,
        sortBy,
      });

      return this.formatResponse(res, 200, true, 'Expenses retrieved successfully', result);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getExpenseById = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const result = await this.expenseService.getExpenseById(id, userId);
      return this.formatResponse(res, 200, true, 'Expense retrieved successfully', result);
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 404;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  createExpense = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const result = await this.expenseService.addExpense(userId, req.body);
      return this.formatResponse(res, 201, true, 'Expense logged successfully', result);
    } catch (err: any) {
      const isValidationError = err.message.includes('Validation failed');
      return this.formatResponse(res, isValidationError ? 400 : 500, false, err.message, null, [err.message]);
    }
  };

  updateExpense = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const result = await this.expenseService.updateExpense(id, userId, req.body);
      return this.formatResponse(res, 200, true, 'Expense updated successfully', result);
    } catch (err: any) {
      const isValidationError = err.message.includes('Validation failed');
      const isAccessDenied = err.message.includes('Access denied');
      const statusCode = isValidationError ? 400 : (isAccessDenied ? 403 : 404);
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  deleteExpense = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      await this.expenseService.removeExpense(id, userId);
      return this.formatResponse(res, 200, true, 'Expense soft deleted successfully');
    } catch (err: any) {
      const isAccessDenied = err.message.includes('Access denied');
      const statusCode = isAccessDenied ? 403 : 404;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };
}
