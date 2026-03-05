import { CategoryType } from '@/domain/types/CategoryType';

// Representa una transaccion puntual registrada por el usuario en una billetera

export interface Transaction {
  readonly id: string;
  readonly userId: string;
  readonly walletId: string;
  readonly categoryId: string;
  readonly assetTypeId: number | null;
  readonly type: CategoryType;
  readonly amount: number;
  readonly description: string;
  readonly detail: readonly TransactionDetail[];
  readonly createdAt: string; // ISO 8601 string
  readonly isRegularization: boolean;
  readonly isActive: boolean;
}

export interface TransactionDetail {
  readonly id: string;
  readonly amount: number;
  readonly description: string;
}

export type CreateTransactionDetail = Omit<TransactionDetail, 'id'>;

export type CreateTransactionInput = Omit<Transaction, 'id'>;
