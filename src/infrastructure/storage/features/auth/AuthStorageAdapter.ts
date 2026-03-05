import { injectable } from 'tsyringe';
import { IAuthStorageRepository, SessionInfo } from '@/domain/repository/IAuthStorageRepository';
import { User } from '@/domain/entities/User';
import { AuthStorageService } from './AuthStorageService';

@injectable()
export class AuthStorageAdapter implements IAuthStorageRepository {
  constructor(private readonly authStorage: AuthStorageService) {}

  async init(): Promise<void> {
    await this.authStorage.init();
  }

  async saveUser(user: User): Promise<boolean> {
    return this.authStorage.saveUser(user);
  }

  async saveLoginMethod(method: 'email' | 'google'): Promise<boolean> {
    return this.authStorage.saveLoginMethod(method);
  }

  async getLoginMethod(): Promise<'email' | 'google' | null> {
    return this.authStorage.getLoginMethod();
  }

  async getSessionInfo(): Promise<SessionInfo> {
    return this.authStorage.getSessionInfo();
  }

  async clearAuthData(): Promise<boolean> {
    return this.authStorage.clearAuthData();
  }

  async cleanupOrRefresh(): Promise<boolean> {
    return this.authStorage.cleanupOrRefresh();
  }

  async refreshSession(): Promise<boolean> {
    return this.authStorage.refreshSession();
  }
}
