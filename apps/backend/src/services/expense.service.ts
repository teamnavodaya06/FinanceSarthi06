import { ExpenseRepository } from '../repositories/expense.repository';

export class ExpenseService {
  private expenseRepo = new ExpenseRepository();

  async getUserExpenses(userId: string) {
    return this.expenseRepo.findByUserId(userId);
  }

  async addExpense(userId: string, data: any) {
    return this.expenseRepo.create({
      userId,
      ...data,
    });
  }

  async removeExpense(id: string, userId: string) {
    return this.expenseRepo.delete(id, userId);
  }
}
