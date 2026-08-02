import { prisma } from '../config';
import { ExpenseCategory } from '@prisma/client';

export interface ExpenseQueryParams {
  userId: string;
  category?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  cursor?: string;
  sortBy?: 'NEWEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC' | 'MERCHANT' | 'CATEGORY';
}

export class ExpenseRepository {
  async findByUserId(userId: string) {
    return prisma.expense.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findWithFilters(params: ExpenseQueryParams) {
    const {
      userId,
      category,
      paymentMethod,
      isRecurring,
      startDate,
      endDate,
      search,
      limit = 20,
      cursor,
      sortBy = 'NEWEST',
    } = params;

    // 1. Build dynamic where clause
    const where: any = {
      userId,
      isDeleted: false,
    };

    if (category) {
      where.category = category as ExpenseCategory;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (isRecurring !== undefined) {
      where.isRecurring = isRecurring;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { merchant: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // 2. Build sorting criteria
    let orderBy: any = { date: 'desc' };
    if (sortBy === 'OLDEST') {
      orderBy = { date: 'asc' };
    } else if (sortBy === 'AMOUNT_DESC') {
      orderBy = { amount: 'desc' };
    } else if (sortBy === 'AMOUNT_ASC') {
      orderBy = { amount: 'asc' };
    } else if (sortBy === 'MERCHANT') {
      orderBy = { merchant: 'asc' };
    } else if (sortBy === 'CATEGORY') {
      orderBy = { category: 'asc' };
    }

    // 3. Cursor-based pagination logic
    const queryArgs: any = {
      where,
      orderBy,
      take: limit + 1, // Fetch limit + 1 to check if there is a next page
    };

    if (cursor) {
      queryArgs.cursor = { id: cursor };
      queryArgs.skip = 1; // Skip the cursor itself
    }

    const results = await prisma.expense.findMany(queryArgs);

    let nextCursor: string | undefined = undefined;
    if (results.length > limit) {
      const nextPageItem = results.pop();
      nextCursor = nextPageItem?.id;
    }

    return {
      expenses: results,
      nextCursor,
    };
  }

  async findById(id: string) {
    return prisma.expense.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async create(userId: string, data: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    merchant?: string;
    subcategory?: string;
    currency?: string;
    paymentMethod?: string;
    account?: string;
    date?: Date;
    notes?: string;
    tags?: string[];
    receiptUrl?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    isRecurring?: boolean;
    recurrenceFrequency?: string;
    status?: string;
    createdBy?: string;
  }) {
    return prisma.expense.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async update(id: string, data: {
    title?: string;
    amount?: number;
    category?: ExpenseCategory;
    merchant?: string;
    subcategory?: string;
    currency?: string;
    paymentMethod?: string;
    account?: string;
    date?: Date;
    notes?: string;
    tags?: string[];
    receiptUrl?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    isRecurring?: boolean;
    recurrenceFrequency?: string;
    status?: string;
    updatedBy?: string;
  }) {
    return prisma.expense.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, userId: string, updatedBy?: string) {
    return prisma.expense.updateMany({
      where: { id, userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy,
      },
    });
  }
}
