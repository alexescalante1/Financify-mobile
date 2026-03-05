import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { User } from '@/domain/entities/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(DI_TOKENS.AuthRepository) private readonly authRepository: IAuthRepository,
  ) {}

  async execute(userData: UserRegistrationVo): Promise<User> {
    return this.authRepository.register(userData);
  }
}
