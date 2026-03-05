import { User } from '@/domain/entities/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';
import { UserUpdateVo } from '@/domain/valueObjects/UserUpdateVo';
import { GoogleUserInfo } from '@/domain/types/GoogleUserInfo';

export interface IAuthRepository {
  register(userData: UserRegistrationVo): Promise<User>;
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(token: string, googleUserInfo: GoogleUserInfo): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateUser(userId: string, updates: UserUpdateVo): Promise<void>;
  isGoogleUser(): Promise<boolean>;
}
