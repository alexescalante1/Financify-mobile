import { GenderType } from '@/domain/types/GenderType';
import { CurrencyType } from '@/domain/types/CurrencyType';

export interface UserRegistrationVo {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly birthDate: string;
  readonly gender: GenderType | null;
  readonly currency: CurrencyType;
}