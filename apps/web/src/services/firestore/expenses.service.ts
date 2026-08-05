import { BaseRepository } from './base.repo';
import { Expense } from '@financesarthi/types';
import { getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';

export class ExpensesService extends BaseRepository {
  async getExpenses(): Promise<Expense[]> {
    const collRef = this.getSubcollectionRef('expenses');
    const snap = await getDocs(collRef);
    const list: Expense[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        list.push({ id: doc.id, ...data } as Expense);
      }
    });
    return list;
  }

  async addExpense(data: Omit<Expense, 'id' | 'userId'>): Promise<string> {
    return this.createInSubcollection('expenses', {
      ...data,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<void> {
    await this.updateInSubcollection('expenses', id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteExpense(id: string): Promise<void> {
    // Perform Hard Delete
    await this.deleteFromSubcollection('expenses', id);
  }

  listenToExpenses(callback: (expenses: Expense[]) => void) {
    return this.getSubcollectionSnapshot('expenses', (snap: QuerySnapshot<DocumentData>) => {
      const list: Expense[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (!data.isDeleted) {
          list.push({ id: d.id, ...data } as Expense);
        }
      });
      callback(list);
    });
  }
}

export const expensesService = new ExpensesService();
