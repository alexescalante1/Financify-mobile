import { CurrencyType } from '@/domain/types/CurrencyType';

export interface WalletUpdateVo {
  readonly name?: string;
  readonly description?: string;
  readonly balance?: number;
  readonly currency?: CurrencyType;
  readonly isPrimary?: boolean;
}
