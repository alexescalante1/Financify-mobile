import type { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import type { IAuthStorageRepository } from '@/domain/repository/IAuthStorageRepository';
import type { User } from '@/domain/entities/User';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

type StateListener = () => void;

export class AuthSessionManager {
  private listeners = new Set<StateListener>();
  private isInitializing = false;
  private hasInitialized = false;
  private isStabilizing = false;
  private stabilizationTimeout: NodeJS.Timeout | null = null;
  private lastAuthChange = 0;
  private firebaseUnsubscribe: (() => void) | null = null;

  public state: AuthState = {
    user: null,
    loading: true,
    error: null,
    isInitialized: false,
  };

  constructor(
    private readonly authStateRepository: IAuthStateRepository,
    private readonly authStorage: IAuthStorageRepository,
  ) {}

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);

    if (!this.hasInitialized && !this.isInitializing) {
      this.initialize();
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  updateState(updates: Partial<AuthState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  stableUpdateState(updates: Partial<AuthState>, delay: number = 300) {
    if (this.stabilizationTimeout) {
      clearTimeout(this.stabilizationTimeout);
    }

    this.isStabilizing = true;

    this.stabilizationTimeout = setTimeout(() => {
      this.state = { ...this.state, ...updates };
      this.isStabilizing = false;
      this.notify();
    }, delay);
  }

  forceStabilize() {
    if (this.stabilizationTimeout) {
      clearTimeout(this.stabilizationTimeout);
      this.isStabilizing = false;
      this.notify();
    }
  }

  destroy() {
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }
    if (this.stabilizationTimeout) {
      clearTimeout(this.stabilizationTimeout);
    }
    this.listeners.clear();
  }

  private notify() {
    if (!this.isStabilizing) {
      this.listeners.forEach((listener) => listener());
    }
  }

  private async initialize() {
    if (this.isInitializing || this.hasInitialized) return;

    try {
      this.isInitializing = true;
      await this.authStorage.init();
      await this.authStorage.cleanupOrRefresh();
      const sessionInfo = await this.authStorage.getSessionInfo();

      if (
        sessionInfo.isAuthenticated &&
        sessionInfo.user &&
        !sessionInfo.sessionExpired
      ) {
        this.updateState({
          user: sessionInfo.user,
          loading: false,
          isInitialized: true,
        });

        setTimeout(() => this.setupFirebaseListener(true), 100);
      } else {
        await this.authStorage.clearAuthData();
        this.setupFirebaseListener(false);
      }
    } catch {
      await this.authStorage.clearAuthData();
      this.setupFirebaseListener(false);
    } finally {
      this.isInitializing = false;
      this.hasInitialized = true;
    }
  }

  private setupFirebaseListener(hasLocalSession: boolean) {
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }

    this.firebaseUnsubscribe = this.authStateRepository.onAuthStateChanged(
      async (userData) => {
        const now = Date.now();

        if (now - this.lastAuthChange < 500) {
          return;
        }
        this.lastAuthChange = now;

        if (userData) {
          const currentUser = this.state.user;
          if (currentUser && currentUser.id === userData.id) {
            await this.authStorage.refreshSession();
            return;
          }

          await this.authStorage.saveUser(userData);

          if (hasLocalSession && this.state.user) {
            this.stableUpdateState({ user: userData }, 100);
          } else {
            this.updateState({ user: userData });
          }
        } else {
          await this.authStorage.clearAuthData();

          if (this.state.user) {
            this.stableUpdateState({ user: null }, 200);
          }
        }

        if (!this.state.isInitialized) {
          this.updateState({ loading: false, isInitialized: true });
        }
      }
    );
  }
}
