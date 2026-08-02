import { BaseRepository } from './base.repo';
import { getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

export class NotificationsService extends BaseRepository {
  async getNotifications(): Promise<UserNotification[]> {
    const collRef = this.getSubcollectionRef('notifications');
    const snap = await getDocs(collRef);
    const list: UserNotification[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as UserNotification);
    });
    return list;
  }

  async addNotification(data: Omit<UserNotification, 'id' | 'createdAt'>): Promise<string> {
    return this.createInSubcollection('notifications', {
      ...data,
      isRead: false,
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.updateInSubcollection('notifications', id, { isRead: true });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.deleteFromSubcollection('notifications', id);
  }

  listenToNotifications(callback: (notifications: UserNotification[]) => void) {
    return this.getSubcollectionSnapshot('notifications', (snap: QuerySnapshot<DocumentData>) => {
      const list: UserNotification[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as UserNotification);
      });
      callback(list);
    });
  }
}

export const notificationsService = new NotificationsService();
