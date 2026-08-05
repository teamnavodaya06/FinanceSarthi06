import { BaseRepository } from './base.repo';
import { Budget } from '@financesarthi/types';
import { getDocs, QuerySnapshot, DocumentData, setDoc, doc } from 'firebase/firestore';

export class BudgetService extends BaseRepository {
  async getBudgets(): Promise<Budget[]> {
    const collRef = this.getSubcollectionRef('budgets');
    const snap = await getDocs(collRef);
    const list: Budget[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Budget);
    });
    return list;
  }

  async setBudget(budgetId: string, data: Partial<Budget>): Promise<void> {
    const collRef = this.getSubcollectionRef('budgets');
    const docRef = doc(collRef, budgetId);
    await setDoc(docRef, {
      ...data,
      id: budgetId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  listenToBudgets(callback: (budgets: Budget[]) => void) {
    return this.getSubcollectionSnapshot('budgets', (snap: QuerySnapshot<DocumentData>) => {
      const list: Budget[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Budget);
      });
      callback(list);
    });
  }
}

export const budgetService = new BudgetService();
