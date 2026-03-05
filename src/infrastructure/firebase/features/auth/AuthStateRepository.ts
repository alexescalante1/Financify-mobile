// infrastructure/firebase/AuthStateRepository.ts
import { injectable, inject } from 'tsyringe';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/infrastructure/firebase/core/FirebaseConfiguration';
import { DI_TOKENS } from '@/domain/di/tokens';

import { User } from '@/domain/entities/User';
import { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import { IAuthRepository } from '@/domain/repository/IAuthRepository';

@injectable()
export class AuthStateRepository implements IAuthStateRepository {
  constructor(
    @inject(DI_TOKENS.AuthRepository) private readonly authRepository: IAuthRepository
  ) {}

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await this.authRepository.getCurrentUser();
          callback(userData);
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  async getCurrentAuthState(): Promise<User | null> {
    return await this.authRepository.getCurrentUser();
  }
}
