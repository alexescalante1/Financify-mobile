import { User } from '@/domain/entities/User';

export interface SessionInfo {
  isAuthenticated: boolean;
  user: User | null;
  lastLogin: string | null; // ISO 8601 string
  loginMethod: 'email' | 'google' | null;
  sessionExpired: boolean;
  sessionVersion: string | null;
  cacheValid: boolean;
}

export interface IAuthStorageRepository {
  init(): Promise<void>;
  saveUser(user: User): Promise<boolean>;
  saveLoginMethod(method: 'email' | 'google'): Promise<boolean>;
  getLoginMethod(): Promise<'email' | 'google' | null>;
  getSessionInfo(): Promise<SessionInfo>;
  clearAuthData(): Promise<boolean>;
  cleanupOrRefresh(): Promise<boolean>;
  refreshSession(): Promise<boolean>;
}
