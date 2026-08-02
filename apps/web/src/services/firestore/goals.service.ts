import { BaseRepository } from './base.repo';
import { Goal } from '@financesarthi/types';
import { getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';

export class GoalsService extends BaseRepository {
  async getGoals(): Promise<Goal[]> {
    const collRef = this.getSubcollectionRef('goals');
    const snap = await getDocs(collRef);
    const list: Goal[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Goal);
    });
    return list;
  }

  async addGoal(data: Omit<Goal, 'id' | 'userId'>): Promise<string> {
    return this.createInSubcollection('goals', data);
  }

  async updateGoal(id: string, data: Partial<Goal>): Promise<void> {
    await this.updateInSubcollection('goals', id, data);
  }

  async deleteGoal(id: string): Promise<void> {
    await this.deleteFromSubcollection('goals', id);
  }

  listenToGoals(callback: (goals: Goal[]) => void) {
    return this.getSubcollectionSnapshot('goals', (snap: QuerySnapshot<DocumentData>) => {
      const list: Goal[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Goal);
      });
      callback(list);
    });
  }
}

export const goalsService = new GoalsService();
