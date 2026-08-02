import { ExpenseRepository, ExpenseQueryParams } from '../repositories/expense.repository';
import { validateExpensePayload, sanitizeInput } from '@financesarthi/utils';
import { ExpenseCategory } from '@prisma/client';

export class ExpenseService {
  private expenseRepo = new ExpenseRepository();

  async getUserExpenses(userId: string) {
    return this.expenseRepo.findByUserId(userId);
  }

  async getFilteredExpenses(params: ExpenseQueryParams) {
    return this.expenseRepo.findWithFilters(params);
  }

  async getExpenseById(id: string, userId: string) {
    const expense = await this.expenseRepo.findById(id);
    if (!expense) {
      throw new Error('Expense not found');
    }
    if (expense.userId !== userId) {
      throw new Error('Access denied: Unauthorized access to expense');
    }
    return expense;
  }

  async addExpense(userId: string, data: any) {
    // 1. Sanitize string inputs
    const sanitizedTitle = data.title ? sanitizeInput(data.title) : '';
    const sanitizedNotes = data.notes ? sanitizeInput(data.notes) : '';
    const sanitizedMerchant = data.merchant ? sanitizeInput(data.merchant) : '';

    const payload = {
      ...data,
      title: sanitizedTitle,
      notes: sanitizedNotes,
      merchant: sanitizedMerchant,
    };

    // 2. Validate payload
    const valResult = validateExpensePayload(payload);
    if (!valResult.success) {
      const errMsgs = valResult.errors.map(e => `${e.field}: ${e.message}`);
      throw new Error(`Validation failed: ${errMsgs.join('; ')}`);
    }

    // 3. Create expense doc
    return this.expenseRepo.create(userId, {
      title: payload.title,
      amount: Number(payload.amount),
      category: payload.category as ExpenseCategory,
      merchant: payload.merchant || null,
      subcategory: payload.subcategory || null,
      currency: payload.currency || 'INR',
      paymentMethod: payload.paymentMethod || 'UPI',
      account: payload.account || null,
      date: payload.date ? new Date(payload.date) : new Date(),
      notes: payload.notes || null,
      tags: payload.tags || [],
      receiptUrl: payload.receiptUrl || null,
      location: payload.location || null,
      latitude: payload.latitude ? Number(payload.latitude) : null,
      longitude: payload.longitude ? Number(payload.longitude) : null,
      isRecurring: Boolean(payload.isRecurring),
      recurrenceFrequency: payload.recurrenceFrequency || null,
      status: payload.status || 'PAID',
      createdBy: userId,
    });
  }

  async updateExpense(id: string, userId: string, data: any) {
    const existing = await this.expenseRepo.findById(id);
    if (!existing) {
      throw new Error('Expense not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Access denied: Unauthorized write access to expense');
    }

    // Merge and validate
    const merged = {
      ...existing,
      ...data,
      date: data.date ? data.date : existing.date.toISOString().split('T')[0],
    };

    // Sanitize string inputs
    const sanitizedTitle = merged.title ? sanitizeInput(merged.title) : '';
    const sanitizedNotes = merged.notes ? sanitizeInput(merged.notes) : '';
    const sanitizedMerchant = merged.merchant ? sanitizeInput(merged.merchant) : '';

    const payload = {
      ...merged,
      title: sanitizedTitle,
      notes: sanitizedNotes,
      merchant: sanitizedMerchant,
    };

    const valResult = validateExpensePayload(payload);
    if (!valResult.success) {
      const errMsgs = valResult.errors.map(e => `${e.field}: ${e.message}`);
      throw new Error(`Validation failed: ${errMsgs.join('; ')}`);
    }

    return this.expenseRepo.update(id, {
      title: payload.title,
      amount: Number(payload.amount),
      category: payload.category as ExpenseCategory,
      merchant: payload.merchant || null,
      subcategory: payload.subcategory || null,
      currency: payload.currency || 'INR',
      paymentMethod: payload.paymentMethod || 'UPI',
      account: payload.account || null,
      date: payload.date ? new Date(payload.date) : new Date(),
      notes: payload.notes || null,
      tags: payload.tags || [],
      receiptUrl: payload.receiptUrl || null,
      location: payload.location || null,
      latitude: payload.latitude ? Number(payload.latitude) : null,
      longitude: payload.longitude ? Number(payload.longitude) : null,
      isRecurring: Boolean(payload.isRecurring),
      recurrenceFrequency: payload.recurrenceFrequency || null,
      status: payload.status || 'PAID',
      updatedBy: userId,
    });
  }

  async removeExpense(id: string, userId: string) {
    const expense = await this.expenseRepo.findById(id);
    if (!expense) {
      throw new Error('Expense not found');
    }
    if (expense.userId !== userId) {
      throw new Error('Access denied: Unauthorized delete access to expense');
    }
    return this.expenseRepo.softDelete(id, userId, userId);
  }
}
