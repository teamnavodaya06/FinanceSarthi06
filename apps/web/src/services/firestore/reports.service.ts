import { BaseRepository } from './base.repo';
import { getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';

export interface AIReport {
  id: string;
  title: string;
  summary: string;
  recommendations: string[];
  generatedAt: string;
  version: string;
}

export class ReportsService extends BaseRepository {
  async getReports(): Promise<AIReport[]> {
    const collRef = this.getSubcollectionRef('aiReports');
    const snap = await getDocs(collRef);
    const list: AIReport[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as AIReport);
    });
    return list;
  }

  async addReport(data: Omit<AIReport, 'id'>): Promise<string> {
    return this.createInSubcollection('aiReports', data);
  }

  async deleteReport(id: string): Promise<void> {
    await this.deleteFromSubcollection('aiReports', id);
  }

  listenToReports(callback: (reports: AIReport[]) => void) {
    return this.getSubcollectionSnapshot('aiReports', (snap: QuerySnapshot<DocumentData>) => {
      const list: AIReport[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as AIReport);
      });
      callback(list);
    });
  }
}

export const reportsService = new ReportsService();
