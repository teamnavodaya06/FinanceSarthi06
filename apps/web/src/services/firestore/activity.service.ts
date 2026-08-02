import { BaseRepository } from './base.repo';
import { getDocs } from 'firebase/firestore';

export interface ActivityLog {
  id?: string;
  event: 'login' | 'logout' | 'profileUpdate' | 'incomeUpdate' | 'expenseCreated' | 'goalCreated' | 'AIReportGenerated';
  details?: any;
  timestamp: string;
}

export class ActivityService extends BaseRepository {
  async logActivity(
    event: 'login' | 'logout' | 'profileUpdate' | 'incomeUpdate' | 'expenseCreated' | 'goalCreated' | 'AIReportGenerated',
    details: any = {}
  ): Promise<string> {
    const payload: Omit<ActivityLog, 'id'> = {
      event,
      details,
      timestamp: new Date().toISOString(),
    };
    return this.createInSubcollection('activityLogs', payload);
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    const collRef = this.getSubcollectionRef('activityLogs');
    const snap = await getDocs(collRef);
    const list: ActivityLog[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as ActivityLog);
    });
    return list;
  }
}

export const activityService = new ActivityService();
