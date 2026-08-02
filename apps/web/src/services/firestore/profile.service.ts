import { BaseRepository } from './base.repo';
import { FirestoreUserProfile } from '@financesarthi/types';

export class ProfileService extends BaseRepository {
  async getProfile(): Promise<FirestoreUserProfile | null> {
    const data = await this.getSingleDocument('profile', 'basic');
    return data as FirestoreUserProfile | null;
  }

  async updateProfile(data: Partial<FirestoreUserProfile>): Promise<void> {
    await this.setSingleDocument('profile', data, 'basic');
  }

  listenToProfile(callback: (profile: FirestoreUserProfile | null) => void) {
    return this.getDocumentSnapshot('profile', 'basic', callback);
  }
}

export const profileService = new ProfileService();
