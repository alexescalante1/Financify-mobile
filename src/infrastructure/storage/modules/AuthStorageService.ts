// infrastructure/storage/modules/AuthStorageService.ts
import { SQLiteStorageService } from '../SQLiteStorageService';
import { User } from '@/domain/models/User';

export class AuthStorageService {
  private static readonly USER_KEY = 'currentUser';
  private static readonly AUTH_STATE_KEY = 'authState';
  private static readonly LAST_LOGIN_KEY = 'lastLogin';
  private static readonly LOGIN_METHOD_KEY = 'loginMethod';

  static async init(): Promise<void> {
    SQLiteStorageService.setPrefix('FinanzasAuth');
    await SQLiteStorageService.init();
    console.log('✅ AuthStorageService inicializado');
  }

  // ==================== USUARIO ====================
  
  static async saveUser(user: User): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      
      const userSaved = await SQLiteStorageService.setObject(this.USER_KEY, user);
      const authStateSaved = await SQLiteStorageService.set(this.AUTH_STATE_KEY, 'authenticated');
      const lastLoginSaved = await SQLiteStorageService.set(this.LAST_LOGIN_KEY, now);
      
      if (userSaved && authStateSaved && lastLoginSaved) {
        console.log(`✅ Usuario ${user.email} guardado`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('💥 Error guardando usuario:', error);
      return false;
    }
  }
  
  static async getUser(): Promise<User | null> {
    return await SQLiteStorageService.getObject<User>(this.USER_KEY);
  }

  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const [authState, user] = await Promise.all([
        SQLiteStorageService.get<string>(this.AUTH_STATE_KEY),
        this.getUser()
      ]);
      
      const isAuth = authState === 'authenticated' && user !== null;
      
      if (isAuth) {
        // Auto-refresh sesión
        await this.refreshSession();
      }
      
      return isAuth;
    } catch (error) {
      console.error('💥 Error verificando auth:', error);
      return false;
    }
  }

  static async updateUser(updates: Partial<User>): Promise<boolean> {
    const updatedUser = {
      ...updates,
      metadata: {
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    return await SQLiteStorageService.updateObject(this.USER_KEY, updatedUser);
  }

  // ==================== SESIÓN ====================
  
  static async saveLoginMethod(method: 'email' | 'google'): Promise<boolean> {
    return await SQLiteStorageService.set(this.LOGIN_METHOD_KEY, method);
  }

  static async getLoginMethod(): Promise<'email' | 'google' | null> {
    return await SQLiteStorageService.get<'email' | 'google'>(this.LOGIN_METHOD_KEY);
  }

  static async getLastLogin(): Promise<Date | null> {
    const lastLogin = await SQLiteStorageService.get<string>(this.LAST_LOGIN_KEY);
    return lastLogin ? new Date(lastLogin) : null;
  }

  static async isSessionExpired(maxDaysValid: number = 30): Promise<boolean> {
    const lastLogin = await this.getLastLogin();
    if (!lastLogin) return true;
    
    const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLogin > maxDaysValid;
  }

  static async refreshSession(): Promise<boolean> {
    const now = new Date().toISOString();
    return await SQLiteStorageService.set(this.LAST_LOGIN_KEY, now);
  }

  // ==================== LIMPIEZA ====================
  
  static async clearAuthData(): Promise<boolean> {
    const keys = [
      this.USER_KEY,
      this.AUTH_STATE_KEY,
      this.LAST_LOGIN_KEY,
      this.LOGIN_METHOD_KEY
    ];
    
    const success = await SQLiteStorageService.removeMultiple(keys);
    
    if (success) {
      console.log('🧹 Datos de auth limpiados');
    }
    
    return success;
  }

  static async cleanupOrRefresh(): Promise<boolean> {
    const [user, authState] = await Promise.all([
      this.getUser(),
      SQLiteStorageService.get<string>(this.AUTH_STATE_KEY)
    ]);
    
    if (user && authState === 'authenticated') {
      const isExpired = await this.isSessionExpired();
      
      if (!isExpired) {
        console.log('🔄 Refrescando sesión válida');
        return await this.refreshSession();
      } else {
        console.log('⏰ Sesión expirada, limpiando');
        return await this.clearAuthData();
      }
    } else {
      console.log('🧹 Datos inconsistentes, limpiando');
      return await this.clearAuthData();
    }
  }

  // ==================== INFO ====================
  
  static async getSessionInfo(): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    lastLogin: Date | null;
    loginMethod: 'email' | 'google' | null;
    sessionExpired: boolean;
  }> {
    const [isAuthenticated, user, lastLogin, loginMethod] = await Promise.all([
      this.isUserAuthenticated(),
      this.getUser(),
      this.getLastLogin(),
      this.getLoginMethod()
    ]);

    const sessionExpired = await this.isSessionExpired();

    return {
      isAuthenticated,
      user,
      lastLogin,
      loginMethod,
      sessionExpired
    };
  }
}