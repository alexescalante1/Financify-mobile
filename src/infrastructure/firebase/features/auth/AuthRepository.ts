import { injectable } from 'tsyringe';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/infrastructure/firebase/core/FirebaseConfiguration';

import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { User } from '@/domain/entities/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';
import { GoogleUserInfo } from '@/domain/types/GoogleUserInfo';
import { AuthErrors } from '@/domain/errors/AuthErrors';
import { UserDAO } from '@/infrastructure/firebase/features/user/UserDAO';
import { UserMapper } from '@/infrastructure/firebase/features/user/UserMapper';
import { UserUpdateVo } from '@/domain/valueObjects/UserUpdateVo';
import { CurrencyType } from '@/domain/types/CurrencyType';

@injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly userDAO: UserDAO) {}

  async register(userData: UserRegistrationVo): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const now = new Date().toISOString();

      const user: User = {
        id: userCredential.user.uid,
        email: userData.email,
        fullName: userData.fullName,
        gender: userData.gender,
        birthDate: userData.birthDate,
        currency: userData.currency as CurrencyType,
        language: 'es',
        country: {
          code: 'PE',
          name: 'Perú'
        },
        preferences: {
          notificationsEnabled: true,
          defaultWalletId: null
        },
        metadata: {
          createdAt: now,
          updatedAt: now
        },
        status: 'active'
      };

      const userDTO = UserMapper.toDTO(user);
      await this.userDAO.create(userDTO);

      return user;
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') throw AuthErrors.emailAlreadyInUse();
      if (code === 'auth/weak-password') throw AuthErrors.weakPassword();
      if (code === 'auth/invalid-email') throw AuthErrors.invalidCredentials('Email inválido');
      throw AuthErrors.unknown(error instanceof Error ? error.message : 'Error desconocido');
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDTO = await this.userDAO.getById(userCredential.user.uid);
      if (!userDTO) {
        throw AuthErrors.userNotFound();
      }
      return UserMapper.toDomain(userDTO);
    } catch (error: unknown) {
      if ((error as any)?.type) throw error; // Already a domain error
      const code = (error as { code?: string })?.code;
      if (code === 'auth/user-not-found') throw AuthErrors.userNotFound();
      if (code === 'auth/wrong-password') throw AuthErrors.invalidCredentials('Contraseña incorrecta');
      if (code === 'auth/invalid-credential') throw AuthErrors.invalidCredentials('Credenciales inválidas');
      throw AuthErrors.unknown(error instanceof Error ? error.message : 'Error en login');
    }
  }

  async loginWithGoogle(token: string, googleUserInfo: GoogleUserInfo): Promise<User> {
    try {
      let credential;

      if (token.includes('.')) {
        credential = GoogleAuthProvider.credential(token);
      } else {
        credential = GoogleAuthProvider.credential(null, token);
      }

      const userCredential = await signInWithCredential(auth, credential);

      const userDTO = await this.userDAO.getById(userCredential.user.uid);

      if (userDTO) {
        return UserMapper.toDomain(userDTO);
      } else {
        return await this.createUserFromGoogleAuth(userCredential, googleUserInfo);
      }

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      throw AuthErrors.googleAuthFailed(msg);
    }
  }

  async logout(): Promise<void> {
    // The original catch block called signOut(auth) again, which would
    // re-enter an infinite recursive loop on any signOut failure.
    // Now we simply re-throw so callers can handle the error appropriately.
    await signOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDTO = await this.userDAO.getById(firebaseUser.uid);
    return userDTO ? UserMapper.toDomain(userDTO) : null;
  }

  async updateUser(userId: string, updates: UserUpdateVo): Promise<void> {
    const partialDTO = UserMapper.toPartialDTO(updates);
    await this.userDAO.update(userId, partialDTO);
  }

  async isGoogleUser(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    return user.providerData.some(provider => provider.providerId === 'google.com');
  }

  private async createUserFromGoogleAuth(userCredential: UserCredential, googleUserInfo: GoogleUserInfo): Promise<User> {
    const now = new Date().toISOString();

    const fullName = googleUserInfo.name ||
                    userCredential.user.displayName ||
                    'Usuario';

    const user: User = {
      id: userCredential.user.uid,
      email: userCredential.user.email || googleUserInfo.email,
      fullName: fullName,
      gender: null,
      birthDate: null,
      currency: 'PEN' as CurrencyType,
      language: 'es',
      country: {
        code: 'PE',
        name: 'Perú'
      },
      preferences: {
        notificationsEnabled: true,
        defaultWalletId: null
      },
      metadata: {
        createdAt: now,
        updatedAt: now
      },
      status: 'active'
    };

    const userDTO = UserMapper.toDTO(user);
    await this.userDAO.create(userDTO);

    return user;
  }
}
