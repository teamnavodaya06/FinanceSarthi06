import { BaseRepository } from './base.repo';
import { Asset } from '@financesarthi/types';
import { getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { netWorthService } from './networth.service';

export class InvestmentsService extends BaseRepository {
  async getInvestments(): Promise<Asset[]> {
    const collRef = this.getSubcollectionRef('investments');
    const snap = await getDocs(collRef);
    const list: Asset[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Asset);
    });
    return list;
  }

  async addInvestment(data: Omit<Asset, 'id' | 'userId'>): Promise<string> {
    const id = await this.createInSubcollection('investments', data);
    await this.syncNetWorth();
    return id;
  }

  async deleteInvestment(id: string): Promise<void> {
    await this.deleteFromSubcollection('investments', id);
    await this.syncNetWorth();
  }

  listenToInvestments(callback: (assets: Asset[]) => void) {
    return this.getSubcollectionSnapshot('investments', (snap: QuerySnapshot<DocumentData>) => {
      const list: Asset[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Asset);
      });
      callback(list);
    });
  }

  private async syncNetWorth() {
    try {
      const assets = await this.getInvestments();
      const total = assets.reduce((sum, a) => sum + a.value, 0);
      
      const currentNetWorth = await netWorthService.getNetWorth();
      const updated = {
        ...currentNetWorth,
        cash: currentNetWorth?.cash ?? 15000,
        bank: assets.filter(a => a.category === 'Bank').reduce((sum, a) => sum + a.value, 0),
        mutualFunds: assets.filter(a => a.category === 'Mutual Funds').reduce((sum, a) => sum + a.value, 0),
        stocks: assets.filter(a => a.category === 'Stocks').reduce((sum, a) => sum + a.value, 0),
        gold: assets.filter(a => a.category === 'Gold').reduce((sum, a) => sum + a.value, 0),
        crypto: assets.filter(a => a.category === 'PF/NPS').reduce((sum, a) => sum + a.value, 0), // PFS/NPS mapped
        totalAssets: total,
      };
      await netWorthService.updateNetWorth(updated as any);
    } catch (err) {
      console.warn('Failed to sync aggregates in netWorth document:', err);
    }
  }
}

export const investmentsService = new InvestmentsService();
