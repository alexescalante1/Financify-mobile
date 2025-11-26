import { injectable } from "tsyringe";
import { Unsubscribe } from "firebase/firestore";

import { IWalletRepository } from "@/domain/interfaces/repository/IWalletRepository";
import { Wallet } from "@/domain/entities/Wallet";
import { WalletDAO } from "@/infrastructure/firebase/dao/WalletDAO";
import { WalletMapper } from "@/infrastructure/firebase/mappers/WalletMapper";

/**
 * Implementación del repositorio de Wallet usando DAO y Mappers
 * Sigue Clean Architecture y principios SOLID
 */
@injectable()
export class WalletRepository implements IWalletRepository {
  private readonly walletDAO: WalletDAO;

  constructor() {
    this.walletDAO = new WalletDAO();
  }

  private getCollectionName(userId: string): string {
    return `users/${userId}/Wallets`;
  }

  // ========================================
  // CRUD BÁSICO
  // ========================================

  /**
   * Registra/crea una nueva wallet
   */
  async register(userId: string, obj: Wallet): Promise<Wallet> {
    try {
      console.log(`📝 Creating wallet "${obj.name}" for user ${userId}`);

      const walletId: number = await this.walletDAO.getNextId(userId);

      const walletWithId: Wallet = {
        ...obj,
        id: walletId,
        createdAt: new Date(),
      };

      const walletDTO = WalletMapper.toDTO(walletWithId);
      await this.walletDAO.create(userId, walletDTO);

      console.log(`✅ Wallet created with ID: ${walletId}`);
      return walletWithId;
    } catch (error) {
      console.error(`❌ Error creating wallet for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene una wallet específica por ID
   */
  async getWalletById(userId: string, walletId: number): Promise<Wallet | null> {
    try {
      console.log(`📖 Getting wallet ${walletId} for user ${userId}`);

      const walletDTO = await this.walletDAO.getById(userId, walletId);

      if (walletDTO) {
        console.log(`✅ Wallet ${walletId} found`);
        return WalletMapper.toDomain(walletDTO);
      } else {
        console.log(`📭 Wallet ${walletId} not found`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting wallet ${walletId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todas las wallets de un usuario
   */
  async getAllWallets(userId: string): Promise<Wallet[]> {
    try {
      console.log(`📚 Getting all wallets for user ${userId}`);

      const walletDTOs = await this.walletDAO.getAll(userId);

      console.log(`📊 Found ${walletDTOs.length} wallets for user ${userId}`);
      return WalletMapper.toDomainList(walletDTOs);
    } catch (error) {
      console.error(`❌ Error getting all wallets for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza una wallet existente
   */
  async updateWallet(userId: string, walletId: number, updates: Partial<Wallet>): Promise<boolean> {
    try {
      console.log(`🔄 Updating wallet ${walletId} for user ${userId}`, updates);

      // No permitir actualizar el ID
      const { id, ...safeUpdates } = updates;

      const walletDTO = WalletMapper.toDTO(safeUpdates as Wallet);
      await this.walletDAO.update(userId, walletId, walletDTO);

      console.log(`✅ Wallet ${walletId} updated successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating wallet ${walletId} for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Elimina una wallet
   */
  async deleteWallet(userId: string, walletId: number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting wallet ${walletId} for user ${userId}`);

      await this.walletDAO.delete(userId, walletId);

      console.log(`✅ Wallet ${walletId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting wallet ${walletId} for user ${userId}:`, error);
      return false;
    }
  }

  // ========================================
  // LISTENERS EN TIEMPO REAL
  // ========================================
  // Los métodos de listeners no se refactorizan por ahora ya que dependen de FirestoreService
  // y no afectan el flujo de registro

  listenToWalletsByDate(
    userId: string,
    startDate: Date,
    endDate: Date,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    throw new Error("Method not refactored yet - use old implementation");
  }

  listenToAllWallets(
    userId: string,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    throw new Error("Method not refactored yet - use old implementation");
  }

  listenToWallet(
    userId: string,
    walletId: number,
    callback: (wallet: Wallet | null) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    throw new Error("Method not refactored yet - use old implementation");
  }

  // ========================================
  // MÉTODOS ESPECÍFICOS DE NEGOCIO
  // ========================================

  /**
   * Obtiene la wallet primaria del usuario
   */
  async getPrimaryWallet(userId: string): Promise<Wallet | null> {
    try {
      console.log(`🌟 Getting primary wallet for user ${userId}`);

      const walletDTO = await this.walletDAO.getPrimary(userId);

      if (walletDTO) {
        console.log(`✅ Primary wallet found`);
        return WalletMapper.toDomain(walletDTO);
      } else {
        console.log(`📭 No primary wallet found`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting primary wallet for user ${userId}:`, error);
      throw error;
    }
  }

  async setPrimaryWallet(userId: string, walletId: number): Promise<boolean> {
    try {
      console.log(`🌟 Setting wallet ${walletId} as primary for user ${userId}`);

      // Desmarcar todas las wallets
      await this.walletDAO.unmarkAllPrimary(userId);

      // Marcar la nueva como primaria
      await this.walletDAO.update(userId, walletId, { isPrimary: true });

      console.log(`✅ Wallet ${walletId} set as primary successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error setting primary wallet ${walletId} for user ${userId}:`, error);
      return false;
    }
  }

  async getWalletsByType(userId: string, type: string): Promise<Wallet[]> {
    throw new Error("Method not refactored yet - use old implementation");
  }

  async getWalletsByCurrency(userId: string, currency: string): Promise<Wallet[]> {
    throw new Error("Method not refactored yet - use old implementation");
  }

  async getWalletsWithMinBalance(userId: string, minBalance: number): Promise<Wallet[]> {
    throw new Error("Method not refactored yet - use old implementation");
  }

  async updateBalance(userId: string, walletId: number, newBalance: number): Promise<boolean> {
    return await this.updateWallet(userId, walletId, { balance: newBalance });
  }

  async incrementBalance(userId: string, walletId: number, amount: number): Promise<boolean> {
    throw new Error("Method not refactored yet - use old implementation");
  }

  async searchWalletsByName(userId: string, searchTerm: string): Promise<Wallet[]> {
    throw new Error("Method not refactored yet - use old implementation");
  }

  async getTotalBalanceByCurrency(userId: string, currency: string): Promise<number> {
    throw new Error("Method not refactored yet - use old implementation");
  }

  async walletNameExists(userId: string, name: string, excludeId?: number): Promise<boolean> {
    throw new Error("Method not refactored yet - use old implementation");
  }

  async getWalletCount(userId: string): Promise<number> {
    const wallets = await this.getAllWallets(userId);
    return wallets.length;
  }
}
