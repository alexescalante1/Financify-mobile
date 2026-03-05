import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { container } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import type { IAuthRepository } from '@/domain/repository/IAuthRepository';
import type { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import type { IAuthStorageRepository } from '@/domain/repository/IAuthStorageRepository';
import type { IGoogleAuthRepository } from '@/domain/repository/IGoogleAuthRepository';
import type { INetworkRepository } from '@/domain/repository/INetworkRepository';
import type { LoginUseCase } from '@/application/auth/useCases/LoginUseCase';
import type { LoginWithGoogleUseCase } from '@/application/auth/useCases/LoginWithGoogleUseCase';
import type { LogoutUseCase } from '@/application/auth/useCases/LogoutUseCase';
import type { RegisterUserUseCase } from '@/application/auth/useCases/RegisterUserUseCase';

export interface AppDependencies {
  authRepository: IAuthRepository;
  authStateRepository: IAuthStateRepository;
  authStorageRepository: IAuthStorageRepository;
  googleAuthRepository: IGoogleAuthRepository;
  networkRepository: INetworkRepository;
  loginUseCase: LoginUseCase;
  loginWithGoogleUseCase: LoginWithGoogleUseCase;
  logoutUseCase: LogoutUseCase;
  registerUserUseCase: RegisterUserUseCase;
}

const DependencyContext = createContext<AppDependencies | null>(null);

export const DependencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dependencies = useMemo<AppDependencies>(() => ({
    authRepository: container.resolve<IAuthRepository>(DI_TOKENS.AuthRepository),
    authStateRepository: container.resolve<IAuthStateRepository>(DI_TOKENS.AuthStateRepository),
    authStorageRepository: container.resolve<IAuthStorageRepository>(DI_TOKENS.AuthStorageRepository),
    googleAuthRepository: container.resolve<IGoogleAuthRepository>(DI_TOKENS.GoogleAuthRepository),
    networkRepository: container.resolve<INetworkRepository>(DI_TOKENS.NetworkRepository),
    loginUseCase: container.resolve<LoginUseCase>(DI_TOKENS.LoginUseCase),
    loginWithGoogleUseCase: container.resolve<LoginWithGoogleUseCase>(DI_TOKENS.LoginWithGoogleUseCase),
    logoutUseCase: container.resolve<LogoutUseCase>(DI_TOKENS.LogoutUseCase),
    registerUserUseCase: container.resolve<RegisterUserUseCase>(DI_TOKENS.RegisterUserUseCase),
  }), []);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = (): AppDependencies => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
};
