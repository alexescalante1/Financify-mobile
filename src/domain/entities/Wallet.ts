import { CurrencyType } from "@/domain/types/CurrencyType";

// Representa una billetera o cuenta bancaria que almacena dinero del usuario
export interface Wallet {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly typeId: number;
  readonly assetTypeId: number;
  readonly balance: number;
  readonly currency: CurrencyType;
  readonly createdAt: string; // ISO string format
  readonly isPrimary: boolean;
}

// Used when creating a new wallet before persistence assigns an id
export type CreateWalletInput = Omit<Wallet, 'id'>;
