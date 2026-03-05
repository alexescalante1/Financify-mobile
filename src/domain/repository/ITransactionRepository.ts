import { Transaction, TransactionDetail } from '@/domain/entities/Transaction';

export interface ITransactionRepository {
  addTransaction(userId: string, transactionData: Omit<Transaction, 'id'>): Promise<void>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getCurrentBalance(userId: string): Promise<number>;
  deleteTransaction(transactionId: string): Promise<void>;
  updateTransactionDetail(transactionId: string, detail: TransactionDetail[]): Promise<void>;
}
