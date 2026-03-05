import { CurrencyType } from '@/domain/types/CurrencyType';
import { GenderType } from '@/domain/types/GenderType';
import { StatusType } from '@/domain/types/StatusType';

export interface UserUpdateVo {
  readonly fullName?: string;
  readonly gender?: GenderType | null;
  readonly birthDate?: string | null;
  readonly currency?: CurrencyType;
  readonly language?: string;
  readonly country?: { readonly code: string; readonly name: string };
  readonly preferences?: {
    readonly notificationsEnabled?: boolean;
    readonly defaultWalletId?: string | null;
  };
  readonly status?: StatusType;
}
