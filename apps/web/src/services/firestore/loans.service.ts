import { BaseRepository } from './base.repo';
import { Liability } from '@financesarthi/types';
import { getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { netWorthService } from './networth.service';

export class LoansService extends BaseRepository {
  async getLoans(): Promise<Liability[]> {
    const collRef = this.getSubcollectionRef('loans');
    const snap = await getDocs(collRef);
    const list: Liability[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Liability);
    });
    return list;
  }

  async addLoan(data: Omit<Liability, 'id' | 'userId'>): Promise<string> {
    const id = await this.createInSubcollection('loans', data);
    await this.syncNetWorth();
    return id;
  }

  async deleteLoan(id: string): Promise<void> {
    await this.deleteFromSubcollection('loans', id);
    await this.syncNetWorth();
  }

  listenToLoans(callback: (loans: Liability[]) => void) {
    return this.getSubcollectionSnapshot('loans', (snap: QuerySnapshot<DocumentData>) => {
      const list: Liability[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Liability);
      });
      callback(list);
    });
  }

  private async syncNetWorth() {
    try {
      const loans = await this.getLoans();
      const total = loans.reduce((sum, l) => sum + l.remaining, 0);

      const currentNetWorth = await netWorthService.getNetWorth();
      const updated = {
        ...currentNetWorth,
        loans: loans.filter(l => l.category === 'Home Loan' || l.category === 'Car Loan' || l.category === 'Education Loan').reduce((sum, l) => sum + l.remaining, 0),
        liabilities: loans.filter(l => l.category === 'Personal Loan' || l.category === 'Credit Card').reduce((sum, l) => sum + l.remaining, 0),
        totalLiabilities: total,
      };
      await netWorthService.updateNetWorth(updated as any);
    } catch (err) {
      console.warn('Failed to sync aggregates in netWorth document:', err);
    }
  }
}

export const loansService = new LoansService();
