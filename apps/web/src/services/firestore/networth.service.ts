import { BaseRepository } from './base.repo';

export interface FirestoreNetWorth {
  cash: number;
  bank: number;
  mutualFunds: number;
  stocks: number;
  gold: number;
  crypto: number;
  realEstate: number;
  loans: number;
  liabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export class NetWorthService extends BaseRepository {
  private runCalculations(data: Partial<FirestoreNetWorth>) {
    const cash = data.cash ?? 0;
    const bank = data.bank ?? 0;
    const mutualFunds = data.mutualFunds ?? 0;
    const stocks = data.stocks ?? 0;
    const gold = data.gold ?? 0;
    const crypto = data.crypto ?? 0;
    const realEstate = data.realEstate ?? 0;

    const loans = data.loans ?? 0;
    const liabilities = data.liabilities ?? 0;

    const totalAssets = cash + bank + mutualFunds + stocks + gold + crypto + realEstate;
    const totalLiabilities = loans + liabilities;
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
    };
  }

  async getNetWorth(): Promise<FirestoreNetWorth | null> {
    const data = await this.getSingleDocument('netWorth', 'current');
    return data as FirestoreNetWorth | null;
  }

  async updateNetWorth(data: Partial<FirestoreNetWorth>): Promise<void> {
    const calcs = this.runCalculations(data);
    const merged = {
      ...data,
      ...calcs,
    };
    await this.setSingleDocument('netWorth', merged, 'current');
  }

  listenToNetWorth(callback: (netWorth: FirestoreNetWorth | null) => void) {
    return this.getDocumentSnapshot('netWorth', 'current', callback);
  }
}

export const netWorthService = new NetWorthService();
