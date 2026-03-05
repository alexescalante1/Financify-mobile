import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import type { IAuthRepository } from '@/domain/repository/IAuthRepository';
import type { IAuthStorageRepository } from '@/domain/repository/IAuthStorageRepository';
import { User } from '@/domain/entities/User';

@injectable()
export class LoginUseCase {
  constructor(
    @inject(DI_TOKENS.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(DI_TOKENS.AuthStorageRepository) private readonly authStorage: IAuthStorageRepository,
  ) {}

  async execute(email: string, password: string): Promise<User> {
    const user = await this.authRepository.login(email, password);
    await this.authStorage.saveUser(user);
    await this.authStorage.saveLoginMethod('email');
    return user;
  }
}
