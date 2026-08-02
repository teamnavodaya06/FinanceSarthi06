import { BaseRepository } from './base.repo';

export interface UserSettings {
  theme: 'dark' | 'light';
  notifications: boolean;
  language: string;
  currency: string;
  privacy: string;
}

export class SettingsService extends BaseRepository {
  async getSettings(): Promise<UserSettings | null> {
    const data = await this.getSingleDocument('settings', 'current');
    return data as UserSettings | null;
  }

  async updateSettings(data: Partial<UserSettings>): Promise<void> {
    await this.setSingleDocument('settings', data, 'current');
  }

  listenToSettings(callback: (settings: UserSettings | null) => void) {
    return this.getDocumentSnapshot('settings', 'current', callback);
  }
}

export const settingsService = new SettingsService();
