import { ExpenseRepository } from '../repositories/expense.repository';
export class ExpenseService {
    expenseRepo = new ExpenseRepository();
    async getUserExpenses(userId) {
        return this.expenseRepo.findByUserId(userId);
    }
    async addExpense(userId, data) {
        return this.expenseRepo.create({
            userId,
            ...data,
        });
    }
    async removeExpense(id, userId) {
        return this.expenseRepo.delete(id, userId);
    }
}
