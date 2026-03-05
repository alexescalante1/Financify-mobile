import { GoogleUserInfo } from '@/domain/types/GoogleUserInfo';

export interface GoogleAuthResult {
  token: string;
  userInfo: GoogleUserInfo;
}

export interface IGoogleAuthRepository {
  signIn(): Promise<GoogleAuthResult | null>;
}
