import { Wallet, CreateWalletInput } from '@/domain/entities/Wallet';
import { WalletUpdateVo } from '@/domain/valueObjects/WalletUpdateVo';
import { WalletType } from '@/domain/types/WalletType';
import { CurrencyType } from '@/domain/types/CurrencyType';
import { WalletError } from '@/domain/errors/WalletErrors';

export type Unsubscribe = () => void;

// CRUD operations
export interface IWalletCrudRepository {
  register(userId: string, obj: CreateWalletInput): Promise<Wallet>;
  getWalletById(userId: string, walletId: string): Promise<Wallet | null>;
  getAllWallets(userId: string): Promise<Wallet[]>;
  updateWallet(userId: string, walletId: string, updates: WalletUpdateVo): Promise<boolean>;
  deleteWallet(userId: string, walletId: string): Promise<boolean>;
}

// Real-time listeners
export interface IWalletStateRepository {
  listenToWalletsByDate(
    userId: string, startDate: Date, endDate: Date,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: WalletError | Error) => void
  ): Unsubscribe;

  listenToAllWallets(
    userId: string,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: WalletError | Error) => void
  ): Unsubscribe;

  listenToWallet(
    userId: string, walletId: string,
    callback: (wallet: Wallet | null) => void,
    onError?: (error: WalletError | Error) => void
  ): Unsubscribe;
}

// Business queries
export interface IWalletQueryRepository {
  getPrimaryWallet(userId: string): Promise<Wallet | null>;
  setPrimaryWallet(userId: string, walletId: string): Promise<boolean>;
  getWalletsByType(userId: string, type: WalletType): Promise<Wallet[]>;
  getWalletsByCurrency(userId: string, currency: CurrencyType): Promise<Wallet[]>;
  updateBalance(userId: string, walletId: string, newBalance: number): Promise<boolean>;
  incrementBalance(userId: string, walletId: string, amount: number): Promise<boolean>;
  searchWalletsByName(userId: string, searchTerm: string): Promise<Wallet[]>;
  getTotalBalanceByCurrency(userId: string, currency: CurrencyType): Promise<number>;
  getWalletCount(userId: string): Promise<number>;
}

// Composite for backward compatibility
export interface IWalletRepository extends IWalletCrudRepository, IWalletStateRepository, IWalletQueryRepository {}
