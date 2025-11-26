import { CurrencyType } from "@/domain/types/CurrencyType";

/**
 * DTO para persistencia de Wallet en Firestore
 * Mapea 1:1 con la entidad Wallet del dominio
 * Subcolección: users/{userId}/Wallets/{walletId}
 */
export interface WalletFirestoreDTO {
  id: number;
  name: string;
  description: string;
  _idType: number;
  _idAssetType: number;
  balance: number;
  currency: CurrencyType;
  createdAt: string; // ISO string en Firestore
  isPrimary: boolean;
}
