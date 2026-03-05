import { Transaction } from '@/domain/entities/Transaction';

export interface ITransactionStateRepository {
  onTransactionsChanged(userId: string, callback: (transactions: Transaction[]) => void): () => void;
}
