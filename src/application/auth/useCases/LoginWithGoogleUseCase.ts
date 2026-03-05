import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import type { IAuthRepository } from '@/domain/repository/IAuthRepository';
import type { IAuthStorageRepository } from '@/domain/repository/IAuthStorageRepository';
import type { IGoogleAuthRepository } from '@/domain/repository/IGoogleAuthRepository';
import { User } from '@/domain/entities/User';

@injectable()
export class LoginWithGoogleUseCase {
  constructor(
    @inject(DI_TOKENS.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(DI_TOKENS.AuthStorageRepository) private readonly authStorage: IAuthStorageRepository,
    @inject(DI_TOKENS.GoogleAuthRepository) private readonly googleAuth: IGoogleAuthRepository,
  ) {}

  async execute(): Promise<User | null> {
    const googleResult = await this.googleAuth.signIn();
    if (!googleResult) return null;

    const user = await this.authRepository.loginWithGoogle(
      googleResult.token,
      googleResult.userInfo,
    );
    await this.authStorage.saveUser(user);
    await this.authStorage.saveLoginMethod('google');
    return user;
  }
}
