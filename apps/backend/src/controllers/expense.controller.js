import { ExpenseService } from '../services/expense.service';
export class ExpenseController {
    expenseService = new ExpenseService();
    getExpenses = async (req, res) => {
        try {
            const userId = req.user?.id || 'demo-user-id';
            const expenses = await this.expenseService.getUserExpenses(userId);
            res.json({ success: true, data: expenses });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    };
    createExpense = async (req, res) => {
        try {
            const userId = req.user?.id || 'demo-user-id';
            const expense = await this.expenseService.addExpense(userId, req.body);
            res.status(201).json({ success: true, data: expense });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    };
}
