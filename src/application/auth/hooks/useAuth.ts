import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDependencies } from '@/presentation/di/DependencyProvider';
import { AuthSessionManager } from '../services/AuthSessionManager';

let sessionManagerInstance: AuthSessionManager | null = null;

export const useAuth = () => {
  const deps = useDependencies();
  const [, forceUpdate] = useState({});

  const sessionManager = useMemo(() => {
    if (!sessionManagerInstance) {
      sessionManagerInstance = new AuthSessionManager(
        deps.authStateRepository,
        deps.authStorageRepository,
      );
    }
    return sessionManagerInstance;
  }, [deps.authStateRepository, deps.authStorageRepository]);

  const rerender = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe(rerender);
    return () => {
      unsubscribe();
    };
  }, [sessionManager, rerender]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      sessionManager.updateState({ loading: true, error: null });
      const user = await deps.loginUseCase.execute(email, password);
      sessionManager.updateState({ user, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error en login';
      sessionManager.updateState({ error: message, loading: false });
      throw err;
    }
  }, [sessionManager, deps.loginUseCase]);

  const loginWithGoogle = useCallback(async () => {
    try {
      sessionManager.updateState({ loading: true, error: null });
      const user = await deps.loginWithGoogleUseCase.execute();
      if (!user) {
        sessionManager.updateState({ loading: false });
        return;
      }
      sessionManager.updateState({ user, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error en login con Google';
      sessionManager.updateState({ error: message, loading: false });
      throw err;
    }
  }, [sessionManager, deps.loginWithGoogleUseCase]);

  const logout = useCallback(async () => {
    try {
      sessionManager.updateState({ loading: true });
      await deps.logoutUseCase.execute();
      sessionManager.updateState({ user: null, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error en logout';
      sessionManager.updateState({ error: message, loading: false });
      await deps.authStorageRepository.clearAuthData();
      sessionManager.updateState({ user: null });
    }
  }, [sessionManager, deps.logoutUseCase, deps.authStorageRepository]);

  const checkIsGoogleUser = useCallback(async (): Promise<boolean> => {
    try {
      const loginMethod = await deps.authStorageRepository.getLoginMethod();
      if (loginMethod === 'google') return true;
      return await deps.authRepository.isGoogleUser();
    } catch {
      return false;
    }
  }, [deps.authRepository, deps.authStorageRepository]);

  return {
    user: sessionManager.state.user,
    loading: sessionManager.state.loading,
    error: sessionManager.state.error,
    isInitialized: sessionManager.state.isInitialized,
    isAuthenticated: !!sessionManager.state.user,
    login,
    loginWithGoogle,
    logout,
    checkIsGoogleUser,
    forceStabilize: () => sessionManager.forceStabilize(),
  };
};
