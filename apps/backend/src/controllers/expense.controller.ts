import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ExpenseService } from '../services/expense.service';

export class ExpenseController {
  private expenseService = new ExpenseService();

  getExpenses = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const expenses = await this.expenseService.getUserExpenses(userId);
      res.json({ success: true, data: expenses });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createExpense = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const expense = await this.expenseService.addExpense(userId, req.body);
      res.status(201).json({ success: true, data: expense });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}
