import { injectable } from 'tsyringe';
import { IGoogleAuthRepository, GoogleAuthResult } from '@/domain/repository/IGoogleAuthRepository';
import { GoogleAuthService } from './GoogleAuthService';

@injectable()
export class GoogleAuthRepository implements IGoogleAuthRepository {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  async signIn(): Promise<GoogleAuthResult | null> {
    return this.googleAuthService.signIn();
  }
}
