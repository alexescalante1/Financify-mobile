// infrastructure/storage/modules/AuthStorageService.ts
import { SQLiteStorageService } from '../SQLiteStorageService';
import { User } from '@/domain/models/User';

export class AuthStorageService {
  private static readonly USER_KEY = 'currentUser';
  private static readonly AUTH_STATE_KEY = 'authState';
  private static readonly LAST_LOGIN_KEY = 'lastLogin';
  private static readonly LOGIN_METHOD_KEY = 'loginMethod';
  private static readonly SESSION_VERSION_KEY = 'sessionVersion';

  // ✅ NUEVO: Cache en memoria para evitar lecturas innecesarias
  private static userCache: User | null = null;
  private static authStateCache: string | null = null;
  private static cacheTimestamp = 0;
  private static readonly CACHE_DURATION = 5000; // 5 segundos

  static async init(): Promise<void> {
    SQLiteStorageService.setPrefix('FinanzasAuth');
    await SQLiteStorageService.init();
    
    // ✅ NUEVO: Cargar cache inicial
    await this.refreshCache();
    
    console.log('✅ AuthStorageService inicializado con cache');
  }

  // ✅ NUEVO: Gestión de cache
  private static async refreshCache(): Promise<void> {
    try {
      const [user, authState] = await Promise.all([
        SQLiteStorageService.getObject<User>(this.USER_KEY),
        SQLiteStorageService.get<string>(this.AUTH_STATE_KEY)
      ]);
      
      this.userCache = user;
      this.authStateCache = authState;
      this.cacheTimestamp = Date.now();
    } catch (error) {
      console.error('Error refrescando cache:', error);
    }
  }

  private static isCacheValid(): boolean {
    return (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // ==================== USUARIO ====================
  
  static async saveUser(user: User): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      
      // ✅ NUEVO: Generar versión de sesión para detectar cambios
      const sessionVersion = `${user.id}_${Date.now()}`;
      
      // ✅ CAMBIO: Usar transacción para atomicidad
      const success = await SQLiteStorageService.setMultiple({
        [this.USER_KEY]: user,
        [this.AUTH_STATE_KEY]: 'authenticated',
        [this.LAST_LOGIN_KEY]: now,
        [this.SESSION_VERSION_KEY]: sessionVersion
      });
      
      if (success) {
        // ✅ NUEVO: Actualizar cache inmediatamente
        this.userCache = user;
        this.authStateCache = 'authenticated';
        this.cacheTimestamp = Date.now();
        
        console.log(`✅ Usuario ${user.email} guardado (v: ${sessionVersion})`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('💥 Error guardando usuario:', error);
      return false;
    }
  }
  
  static async getUser(): Promise<User | null> {
    try {
      // ✅ NUEVO: Usar cache si es válido
      if (this.isCacheValid() && this.userCache) {
        return this.userCache;
      }
      
      const user = await SQLiteStorageService.getObject<User>(this.USER_KEY);
      
      // ✅ NUEVO: Actualizar cache
      this.userCache = user;
      this.cacheTimestamp = Date.now();
      
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  static async isUserAuthenticated(): Promise<boolean> {
    try {
      // ✅ NUEVO: Usar cache para verificación rápida
      if (this.isCacheValid()) {
        const isAuth = this.authStateCache === 'authenticated' && this.userCache !== null;
        if (isAuth) {
          // Auto-refresh en background
          this.refreshSession().catch(err => 
            console.warn('Error auto-refrescando:', err)
          );
        }
        return isAuth;
      }
      
      // Cache expirado, leer desde SQLite
      await this.refreshCache();
      const isAuth = this.authStateCache === 'authenticated' && this.userCache !== null;
      
      if (isAuth) {
        await this.refreshSession();
      }
      
      return isAuth;
    } catch (error) {
      console.error('💥 Error verificando auth:', error);
      return false;
    }
  }

  static async updateUser(updates: Partial<User>): Promise<boolean> {
    try {
      const currentUser = await this.getUser();
      if (!currentUser) return false;
      
      const updatedUser = {
        ...currentUser,
        ...updates,
        metadata: {
          ...currentUser.metadata,
          ...updates.metadata,
          updatedAt: new Date().toISOString()
        }
      };
      
      const success = await SQLiteStorageService.setObject(this.USER_KEY, updatedUser);
      
      if (success) {
        // ✅ NUEVO: Actualizar cache
        this.userCache = updatedUser;
        this.cacheTimestamp = Date.now();
      }
      
      return success;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return false;
    }
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

  // ✅ MEJORADO: Configuración más flexible de expiración
  static async isSessionExpired(maxDaysValid: number = 30): Promise<boolean> {
    try {
      const lastLogin = await this.getLastLogin();
      if (!lastLogin) return true;
      
      const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      const isExpired = daysSinceLogin > maxDaysValid;
      
      if (isExpired) {
        console.log(`⏰ Sesión expirada: ${daysSinceLogin.toFixed(1)} días`);
      }
      
      return isExpired;
    } catch (error) {
      console.error('Error verificando expiración:', error);
      return true;
    }
  }

  static async refreshSession(): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const success = await SQLiteStorageService.set(this.LAST_LOGIN_KEY, now);
      
      if (success) {
        console.log(`🔄 Sesión refrescada: ${new Date(now).toLocaleString()}`);
      }
      
      return success;
    } catch (error) {
      console.error('Error refrescando sesión:', error);
      return false;
    }
  }

  // ✅ NUEVO: Verificar si la sesión cambió (para detectar login desde otro dispositivo)
  static async getSessionVersion(): Promise<string | null> {
    return await SQLiteStorageService.get<string>(this.SESSION_VERSION_KEY);
  }

  static async hasSessionChanged(lastKnownVersion: string | null): Promise<boolean> {
    const currentVersion = await this.getSessionVersion();
    return currentVersion !== lastKnownVersion;
  }

  // ==================== LIMPIEZA ====================
  
  static async clearAuthData(): Promise<boolean> {
    const keys = [
      this.USER_KEY,
      this.AUTH_STATE_KEY,
      this.LAST_LOGIN_KEY,
      this.LOGIN_METHOD_KEY,
      this.SESSION_VERSION_KEY
    ];
    
    const success = await SQLiteStorageService.removeMultiple(keys);
    
    if (success) {
      // ✅ NUEVO: Limpiar cache también
      this.userCache = null;
      this.authStateCache = null;
      this.cacheTimestamp = 0;
      
      console.log('🧹 Datos de auth y cache limpiados');
    }
    
    return success;
  }

  static async cleanupOrRefresh(): Promise<boolean> {
    try {
      // ✅ NUEVO: Verificar consistencia con cache
      await this.refreshCache();
      
      if (this.userCache && this.authStateCache === 'authenticated') {
        const isExpired = await this.isSessionExpired();
        
        if (!isExpired) {
          console.log('🔄 Sesión válida - refrescando');
          return await this.refreshSession();
        } else {
          console.log('⏰ Sesión expirada - limpiando');
          return await this.clearAuthData();
        }
      } else {
        console.log('🧹 Datos inconsistentes - limpiando');
        return await this.clearAuthData();
      }
    } catch (error) {
      console.error('Error en cleanup:', error);
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
    } catch (error) {
      console.error('Error obteniendo session info:', error);
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

  // ✅ NUEVO: Forzar actualización de cache
  static async forceCacheRefresh(): Promise<void> {
    await this.refreshCache();
  }

  // ✅ NUEVO: Obtener estadísticas de cache
  static getCacheStats(): {
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