import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import type { IAuthRepository } from '@/domain/repository/IAuthRepository';
import type { IAuthStorageRepository } from '@/domain/repository/IAuthStorageRepository';

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(DI_TOKENS.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(DI_TOKENS.AuthStorageRepository) private readonly authStorage: IAuthStorageRepository,
  ) {}

  async execute(): Promise<void> {
    await this.authStorage.clearAuthData();
    this.authRepository.logout().catch(() => {});
  }
}
