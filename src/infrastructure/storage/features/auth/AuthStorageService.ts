import { injectable } from 'tsyringe';
import { SQLiteStorageService } from '../../core/SQLiteStorageService';
import { User } from '@/domain/entities/User';
import { UserUpdateVo } from '@/domain/valueObjects/UserUpdateVo';

@injectable()
export class AuthStorageService {
  private readonly USER_KEY = 'currentUser';
  private readonly AUTH_STATE_KEY = 'authState';
  private readonly LAST_LOGIN_KEY = 'lastLogin';
  private readonly LOGIN_METHOD_KEY = 'loginMethod';
  private readonly SESSION_VERSION_KEY = 'sessionVersion';

  private userCache: User | null = null;
  private authStateCache: string | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 5000;

  constructor(private readonly sqliteService: SQLiteStorageService) {}

  async init(): Promise<void> {
    this.sqliteService.setPrefix('FinanzasAuth');
    await this.sqliteService.init();
    await this.refreshCache();
  }

  private async refreshCache(): Promise<void> {
    try {
      const [user, authState] = await Promise.all([
        this.sqliteService.getObject<User>(this.USER_KEY),
        this.sqliteService.get<string>(this.AUTH_STATE_KEY)
      ]);

      this.userCache = user;
      this.authStateCache = authState;
      this.cacheTimestamp = Date.now();
    } catch (error) {
      console.warn('[AuthStorage] refreshCache failed:', error);
    }
  }

  private isCacheValid(): boolean {
    return (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // ==================== USUARIO ====================

  async saveUser(user: User): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const sessionVersion = `${user.id}_${Date.now()}`;

      const success = await this.sqliteService.setMultiple({
        [this.USER_KEY]: user,
        [this.AUTH_STATE_KEY]: 'authenticated',
        [this.LAST_LOGIN_KEY]: now,
        [this.SESSION_VERSION_KEY]: sessionVersion
      });

      if (success) {
        this.userCache = user;
        this.authStateCache = 'authenticated';
        this.cacheTimestamp = Date.now();
      }

      return success;
    } catch {
      return false;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      if (this.isCacheValid() && this.userCache) {
        return this.userCache;
      }

      const user = await this.sqliteService.getObject<User>(this.USER_KEY);

      this.userCache = user;
      this.cacheTimestamp = Date.now();

      return user;
    } catch {
      return null;
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    try {
      if (this.isCacheValid()) {
        const isAuth = this.authStateCache === 'authenticated' && this.userCache !== null;
        if (isAuth) {
          this.refreshSession().catch(() => {});
        }
        return isAuth;
      }

      await this.refreshCache();
      const isAuth = this.authStateCache === 'authenticated' && this.userCache !== null;

      if (isAuth) {
        await this.refreshSession();
      }

      return isAuth;
    } catch {
      return false;
    }
  }

  async updateUser(updates: UserUpdateVo): Promise<boolean> {
    try {
      const currentUser = await this.getUser();
      if (!currentUser) return false;

      const updatedUser = {
        ...currentUser,
        ...(updates.fullName !== undefined && { fullName: updates.fullName }),
        ...(updates.gender !== undefined && { gender: updates.gender }),
        ...(updates.birthDate !== undefined && { birthDate: updates.birthDate }),
        ...(updates.currency !== undefined && { currency: updates.currency }),
        ...(updates.language !== undefined && { language: updates.language }),
        ...(updates.country !== undefined && { country: updates.country }),
        ...(updates.status !== undefined && { status: updates.status }),
        preferences: {
          ...currentUser.preferences,
          ...(updates.preferences?.notificationsEnabled !== undefined && { notificationsEnabled: updates.preferences.notificationsEnabled }),
          ...(updates.preferences?.defaultWalletId !== undefined && { defaultWalletId: updates.preferences.defaultWalletId }),
        },
        metadata: {
          ...currentUser.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      const success = await this.sqliteService.setObject(this.USER_KEY, updatedUser);

      if (success) {
        this.userCache = updatedUser;
        this.cacheTimestamp = Date.now();
      }

      return success;
    } catch {
      return false;
    }
  }

  // ==================== SESION ====================

  async saveLoginMethod(method: 'email' | 'google'): Promise<boolean> {
    return await this.sqliteService.set(this.LOGIN_METHOD_KEY, method);
  }

  async getLoginMethod(): Promise<'email' | 'google' | null> {
    return await this.sqliteService.get<'email' | 'google'>(this.LOGIN_METHOD_KEY);
  }

  async getLastLogin(): Promise<string | null> {
    return await this.sqliteService.get<string>(this.LAST_LOGIN_KEY);
  }

  async isSessionExpired(maxDaysValid: number = 30): Promise<boolean> {
    try {
      const lastLogin = await this.getLastLogin();
      if (!lastLogin) return true;

      const daysSinceLogin = (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin > maxDaysValid;
    } catch {
      return true;
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      return await this.sqliteService.set(this.LAST_LOGIN_KEY, now);
    } catch {
      return false;
    }
  }

  async getSessionVersion(): Promise<string | null> {
    return await this.sqliteService.get<string>(this.SESSION_VERSION_KEY);
  }

  async hasSessionChanged(lastKnownVersion: string | null): Promise<boolean> {
    const currentVersion = await this.getSessionVersion();
    return currentVersion !== lastKnownVersion;
  }

  // ==================== LIMPIEZA ====================

  async clearAuthData(): Promise<boolean> {
    const keys = [
      this.USER_KEY,
      this.AUTH_STATE_KEY,
      this.LAST_LOGIN_KEY,
      this.LOGIN_METHOD_KEY,
      this.SESSION_VERSION_KEY
    ];

    const success = await this.sqliteService.removeMultiple(keys);

    if (success) {
      this.userCache = null;
      this.authStateCache = null;
      this.cacheTimestamp = 0;
    }

    return success;
  }

  async cleanupOrRefresh(): Promise<boolean> {
    try {
      await this.refreshCache();

      if (this.userCache && this.authStateCache === 'authenticated') {
        const isExpired = await this.isSessionExpired();

        if (!isExpired) {
          return await this.refreshSession();
        } else {
          return await this.clearAuthData();
        }
      } else {
        return await this.clearAuthData();
      }
    } catch {
      return await this.clearAuthData();
    }
  }

  // ==================== INFO ====================

  async getSessionInfo(): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    lastLogin: string | null;
    loginMethod: 'email' | 'google' | null;
    sessionExpired: boolean;
    sessionVersion: string | null;
    cacheValid: boolean;
  }> {
    try {
      const [isAuthenticated, user, lastLogin, loginMethod, sessionVersion] = await Promise.all([
        this.isUserAuthenticated(),
        this.getUser(),
        this.getLastLogin(),
        this.getLoginMethod(),
        this.getSessionVersion()
      ]);

      const sessionExpired = await this.isSessionExpired();

      return {
        isAuthenticated,
        user,
        lastLogin,
        loginMethod,
        sessionExpired,
        sessionVersion,
        cacheValid: this.isCacheValid()
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null,
        lastLogin: null,
        loginMethod: null,
        sessionExpired: true,
        sessionVersion: null,
        cacheValid: false
      };
    }
  }

  async forceCacheRefresh(): Promise<void> {
    await this.refreshCache();
  }

  getCacheStats(): {
    hasUserCache: boolean;
    hasAuthStateCache: boolean;
    cacheAge: number;
    isValid: boolean;
  } {
    return {
      hasUserCache: this.userCache !== null,
      hasAuthStateCache: this.authStateCache !== null,
      cacheAge: Date.now() - this.cacheTimestamp,
      isValid: this.isCacheValid()
    };
  }
}
