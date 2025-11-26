import { CurrencyType } from "@/domain/types/CurrencyType";

/**
 * DTO para persistir Wallet en Firestore
 * Representa la estructura exacta de los documentos en la subcolección 'users/{userId}/Wallets'
 */
export interface WalletDTO {
  id: number;
  name: string;
  description: string;
  _idType: number;
  _idAssetType: number;
  balance: number;
  currency: CurrencyType;
  createdAt: string; // ISO string format en Firestore
  isPrimary: boolean;
}
