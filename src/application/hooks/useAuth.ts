// application/hooks/useAuth.ts
import { container } from "tsyringe";
import { useState, useEffect, useCallback } from "react";
import { IAuthRepository } from "@/domain/repository/IAuthRepository";
import { IAuthStateRepository } from "@/domain/repository/IAuthStateRepository";
import { User } from "@/domain/models/User";
import { UserRegistrationVo } from "@/domain/valueObjects/UserRegistrationVo";
import { AuthStorageService } from "@/infrastructure/storage/modules/AuthStorageService";
import { RegisterUserUseCase } from "@/application/useCases/auth/RegisterUserUseCase";
import { GoogleAuthService } from "@/infrastructure/auth/GoogleAuthService";

class AuthManager {
  private static instance: AuthManager;
  private authRepository: IAuthRepository;
  private authStateRepository: IAuthStateRepository;
  private registerUserUseCase: RegisterUserUseCase;
  private listeners: Set<() => void> = new Set();
  private isInitializing = false;
  private hasInitialized = false;

  // ✅ NUEVO: Control de estabilidad
  private isStabilizing = false;
  private stabilizationTimeout: NodeJS.Timeout | null = null;
  private lastAuthChange = 0;
  private firebaseUnsubscribe: (() => void) | null = null;

  public state = {
    user: null as User | null,
    loading: true,
    error: null as string | null,
    isInitialized: false,
  };

  private constructor() {
    this.authRepository = container.resolve<IAuthRepository>("IAuthRepository");
    this.authStateRepository = container.resolve<IAuthStateRepository>(
      "IAuthStateRepository"
    );
    this.registerUserUseCase = container.resolve(RegisterUserUseCase);
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    if (!this.hasInitialized && !this.isInitializing) {
      this.initialize();
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    // ✅ NUEVO: Solo notificar si no está estabilizando
    if (!this.isStabilizing) {
      this.listeners.forEach((listener) => listener());
    }
  }

  private updateState(updates: Partial<typeof this.state>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // ✅ NUEVO: Actualización estable con debounce
  private stableUpdateState(
    updates: Partial<typeof this.state>,
    delay: number = 300
  ) {
    // Cancelar timeout anterior
    if (this.stabilizationTimeout) {
      clearTimeout(this.stabilizationTimeout);
    }

    // Marcar como estabilizando
    this.isStabilizing = true;

    // Aplicar cambios después del delay
    this.stabilizationTimeout = setTimeout(() => {
      this.state = { ...this.state, ...updates };
      this.isStabilizing = false;
      this.notify();
    }, delay);
  }

  private async initialize() {
    if (this.isInitializing || this.hasInitialized) return;

    try {
      this.isInitializing = true;
      console.log("🔄 Inicializando auth...");

      // Inicializar SQLite
      await AuthStorageService.init();

      // Verificar sesión local primero (más rápido)
      await AuthStorageService.cleanupOrRefresh();
      const sessionInfo = await AuthStorageService.getSessionInfo();

      if (
        sessionInfo.isAuthenticated &&
        sessionInfo.user &&
        !sessionInfo.sessionExpired
      ) {
        console.log(
          "✅ Sesión local válida - estableciendo usuario inmediatamente"
        );

        // ✅ CAMBIO: Establecer usuario inmediatamente sin esperas
        this.updateState({
          user: sessionInfo.user,
          loading: false,
          isInitialized: true,
        });

        // ✅ NUEVO: Configurar Firebase listener DESPUÉS de establecer estado local
        setTimeout(() => this.setupFirebaseListener(true), 100);
      } else {
        console.log("❌ Sin sesión local válida");
        await AuthStorageService.clearAuthData();

        // ✅ CAMBIO: Configurar Firebase listener inmediatamente
        this.setupFirebaseListener(false);
      }
    } catch (error) {
      console.error("💥 Error inicializando:", error);
      await AuthStorageService.clearAuthData();
      this.setupFirebaseListener(false);
    } finally {
      this.isInitializing = false;
      this.hasInitialized = true;
    }
  }

  // ✅ MEJORADO: Firebase listener con control de parpadeo
  private setupFirebaseListener(hasLocalSession: boolean) {
    console.log("👂 Configurando Firebase listener...", { hasLocalSession });

    // Limpiar listener anterior si existe
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }

    this.firebaseUnsubscribe = this.authStateRepository.onAuthStateChanged(
      async (userData) => {
        const now = Date.now();

        // ✅ NUEVO: Evitar cambios muy frecuentes
        if (now - this.lastAuthChange < 500) {
          console.log("🚫 Cambio de auth ignorado - muy frecuente");
          return;
        }
        this.lastAuthChange = now;

        console.log("🔥 Firebase auth cambió:", {
          hasUser: !!userData,
          userId: userData?.id,
        });

        if (userData) {
          // ✅ CAMBIO: Verificar si ya tenemos este usuario localmente
          const currentUser = this.state.user;
          if (currentUser && currentUser.id === userData.id) {
            console.log(
              "✅ Usuario ya establecido localmente - solo refrescando"
            );
            await AuthStorageService.refreshSession();
            return;
          }

          // Usuario nuevo o diferente
          console.log("📱 Guardando usuario desde Firebase");
          await AuthStorageService.saveUser(userData);

          // ✅ NUEVO: Si ya había sesión local, usar actualización estable
          if (hasLocalSession && this.state.user) {
            this.stableUpdateState({ user: userData }, 100);
          } else {
            this.updateState({ user: userData });
          }
        } else {
          // Sin usuario en Firebase
          console.log("🚪 Firebase sin usuario - limpiando");
          await AuthStorageService.clearAuthData();

          // ✅ NUEVO: Solo actualizar si realmente había un usuario
          if (this.state.user) {
            this.stableUpdateState({ user: null }, 200);
          }
        }

        // ✅ CAMBIO: Marcar como inicializado solo al final
        if (!this.state.isInitialized) {
          this.updateState({ loading: false, isInitialized: true });
        }
      }
    );
  }

  async register(userData: UserRegistrationVo) {
    try {
      this.updateState({ loading: true, error: null });

      // Usar Use Case para manejar toda la lógica de registro
      const newUser = await this.registerUserUseCase.execute(userData);

      await AuthStorageService.saveUser(newUser);
      await AuthStorageService.saveLoginMethod("email");

      this.updateState({ user: newUser, loading: false });
    } catch (err: any) {
      this.updateState({ error: err.message, loading: false });
      throw err;
    }
  }

  async login(email: string, password: string) {
    try {
      this.updateState({ loading: true, error: null });
      const userData = await this.authRepository.login(email, password);

      // ✅ CAMBIO: Guardar en SQLite primero, antes que Firebase notifique
      await AuthStorageService.saveUser(userData);
      await AuthStorageService.saveLoginMethod("email");

      // ✅ NUEVO: Establecer usuario inmediatamente
      this.updateState({ user: userData, loading: false });

      console.log("✅ Login completado - usuario establecido");
    } catch (err: any) {
      this.updateState({ error: err.message, loading: false });
      throw err;
    }
  }

  async loginWithGoogle() {
    try {
      this.updateState({ loading: true, error: null });

      const googleResult = await GoogleAuthService.signIn();

      if (!googleResult) {
        this.updateState({ loading: false });
        return;
      }

      const userData = await this.authRepository.loginWithGoogle(
        googleResult.token,
        googleResult.userInfo
      );

      await AuthStorageService.saveUser(userData);
      await AuthStorageService.saveLoginMethod("google");

      this.updateState({ user: userData, loading: false });
    } catch (err: any) {
      this.updateState({ error: err.message, loading: false });
      throw err;
    }
  }

  async logout() {
    try {
      this.updateState({ loading: true });

      // ✅ CAMBIO: Limpiar local primero
      await AuthStorageService.clearAuthData();

      // ✅ NUEVO: Establecer estado inmediatamente
      this.updateState({ user: null, loading: false });

      // Firebase logout en background
      this.authRepository.logout().catch((err) => {
        console.warn("⚠️ Error en logout de Firebase:", err);
      });

      console.log("🚪 Logout completado");
    } catch (err: any) {
      this.updateState({ error: err.message, loading: false });
      await AuthStorageService.clearAuthData();
      this.updateState({ user: null });
    }
  }

  async checkIsGoogleUser(): Promise<boolean> {
    try {
      const loginMethod = await AuthStorageService.getLoginMethod();
      if (loginMethod === "google") return true;
      return await this.authRepository.isGoogleUser();
    } catch {
      return false;
    }
  }

  // ✅ NUEVO: Método para forzar estabilización
  forceStabilize() {
    if (this.stabilizationTimeout) {
      clearTimeout(this.stabilizationTimeout);
      this.isStabilizing = false;
      this.notify();
    }
  }

  // ✅ NUEVO: Cleanup al destruir
  destroy() {
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }
    if (this.stabilizationTimeout) {
      clearTimeout(this.stabilizationTimeout);
    }
    this.listeners.clear();
  }
}

export const useAuth = () => {
  const [, forceUpdate] = useState({});
  const authManager = AuthManager.getInstance();

  const rerender = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    return authManager.subscribe(rerender);
  }, [rerender]);

  // ✅ NUEVO: Cleanup en unmount del componente principal
  useEffect(() => {
    return () => {
      // Solo limpiar la suscripción, no destruir el manager
    };
  }, []);

  return {
    user: authManager.state.user,
    loading: authManager.state.loading,
    error: authManager.state.error,
    isInitialized: authManager.state.isInitialized,
    isAuthenticated: !!authManager.state.user,
    register: (userData: UserRegistrationVo) => authManager.register(userData),
    login: (email: string, password: string) =>
      authManager.login(email, password),
    loginWithGoogle: () => authManager.loginWithGoogle(),
    logout: () => authManager.logout(),
    checkIsGoogleUser: () => authManager.checkIsGoogleUser(),

    // ✅ NUEVO: Método de emergencia para estabilizar
    forceStabilize: () => authManager.forceStabilize(),
  };
};
