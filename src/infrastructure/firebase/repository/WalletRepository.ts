import { injectable, container } from "tsyringe";
import { Unsubscribe } from "firebase/firestore";

import IFirebaseFirestoreService from "@/domain/interfaces/service/IFirebaseFirestoreService";
import { IWalletRepository } from "@/domain/interfaces/repository/IWalletRepository";
import { Wallet } from "@/domain/entities/Wallet";

@injectable()
export class WalletRepository implements IWalletRepository {
  private firestoreService: IFirebaseFirestoreService;

  constructor() {
    this.firestoreService = container.resolve<IFirebaseFirestoreService>(
      "IFirebaseFirestoreService"
    );
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
      
      const walletId: number =
        (await this.firestoreService.getMaxId(this.getCollectionName(userId))) + 1;
      
      const walletWithId: Wallet = {
        ...obj,
        id: walletId,
        createdAt: new Date().toISOString(), // Asegurar fecha de creación
      };

      await this.firestoreService.setDocument(
        this.getCollectionName(userId),
        walletId.toString(),
        walletWithId,
        false // No merge para nuevos documentos
      );

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
      
      const wallet = await this.firestoreService.getDocumentById(
        this.getCollectionName(userId),
        walletId.toString()
      );

      if (wallet) {
        console.log(`✅ Wallet ${walletId} found`);
        return wallet as Wallet;
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
      
      const wallets = await this.firestoreService.getDocuments(
        this.getCollectionName(userId),
        {
          orderBy: [{ field: "createdAt", direction: "desc" }]
        }
      );

      console.log(`📊 Found ${wallets.length} wallets for user ${userId}`);
      return wallets as Wallet[];
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
      
      const success = await this.firestoreService.updateDocument(
        this.getCollectionName(userId),
        walletId.toString(),
        safeUpdates
      );

      if (success) {
        console.log(`✅ Wallet ${walletId} updated successfully`);
      } else {
        console.log(`⚠️ Failed to update wallet ${walletId}`);
      }

      return success;
    } catch (error) {
      console.error(`❌ Error updating wallet ${walletId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una wallet
   */
  async deleteWallet(userId: string, walletId: number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting wallet ${walletId} for user ${userId}`);
      
      const success = await this.firestoreService.deleteDocument(
        this.getCollectionName(userId),
        walletId.toString()
      );

      if (success) {
        console.log(`✅ Wallet ${walletId} deleted successfully`);
      } else {
        console.log(`⚠️ Failed to delete wallet ${walletId}`);
      }

      return success;
    } catch (error) {
      console.error(`❌ Error deleting wallet ${walletId} for user ${userId}:`, error);
      throw error;
    }
  }

  // ========================================
  // LISTENERS EN TIEMPO REAL
  // ========================================

  /**
   * Escucha wallets por rango de fechas (método existente)
   */
  listenToWalletsByDate(
    userId: string,
    startDate: Date,
    endDate: Date,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    console.log(`👂 Setting up date range listener for user ${userId}`);
    
    return this.firestoreService.listenToCollectionByDateRange(
      this.getCollectionName(userId),
      "createdAt",
      startDate,
      endDate,
      (docs) => {
        console.log(`📡 Received ${docs.length} wallets in date range`);
        callback(docs as Wallet[]);
      },
      onError
    );
  }

  /**
   * Escucha todas las wallets de un usuario en tiempo real
   */
  listenToAllWallets(
    userId: string,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    console.log(`👂 Setting up listener for all wallets of user ${userId}`);
    
    return this.firestoreService.listenToCollection(
      this.getCollectionName(userId),
      (docs) => {
        console.log(`📡 Received ${docs.length} wallets`);
        callback(docs as Wallet[]);
      },
      onError,
      {
        orderBy: [{ field: "createdAt", direction: "desc" }]
      }
    );
  }

  /**
   * Escucha una wallet específica en tiempo real
   */
  listenToWallet(
    userId: string,
    walletId: number,
    callback: (wallet: Wallet | null) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    console.log(`👂 Setting up listener for wallet ${walletId} of user ${userId}`);
    
    return this.firestoreService.listenToDocument(
      this.getCollectionName(userId),
      walletId.toString(),
      (doc) => {
        console.log(`📡 Wallet ${walletId} data changed`);
        callback(doc as Wallet | null);
      },
      onError
    );
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
      
      const wallets = await this.firestoreService.getDocuments(
        this.getCollectionName(userId),
        {
          where: [{ field: "isPrimary", operator: "==", value: true }],
          limit: 1
        }
      );

      if (wallets.length > 0) {
        console.log(`✅ Primary wallet found`);
        return wallets[0] as Wallet;
      } else {
        console.log(`📭 No primary wallet found`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting primary wallet for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Establece una wallet como primaria (y quita el flag de las demás)
   */
  async setPrimaryWallet(userId: string, walletId: number): Promise<boolean> {
    try {
      console.log(`🌟 Setting wallet ${walletId} as primary for user ${userId}`);
      
      // Obtener todas las wallets del usuario
      const allWallets = await this.getAllWallets(userId);
      
      // Preparar updates en batch
      const updates: { [path: string]: any } = {};
      const collectionName = this.getCollectionName(userId);
      
      // Quitar isPrimary de todas las wallets
      allWallets.forEach(wallet => {
        if (wallet.id) {
          updates[`${collectionName}/${wallet.id}/isPrimary`] = false;
        }
      });
      
      // Establecer la nueva wallet como primaria
      updates[`${collectionName}/${walletId}/isPrimary`] = true;
      
      // Ejecutar batch update
      const success = await this.firestoreService.multiPathUpdate(updates);
      
      if (success) {
        console.log(`✅ Wallet ${walletId} set as primary successfully`);
      } else {
        console.log(`⚠️ Failed to set wallet ${walletId} as primary`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error setting primary wallet ${walletId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene wallets por tipo
   */
  async getWalletsByType(userId: string, type: string): Promise<Wallet[]> {
    try {
      console.log(`🏷️ Getting wallets of type "${type}" for user ${userId}`);
      
      const wallets = await this.firestoreService.getDocuments(
        this.getCollectionName(userId),
        {
          where: [{ field: "type", operator: "==", value: type }],
          orderBy: [{ field: "createdAt", direction: "desc" }]
        }
      );

      console.log(`📊 Found ${wallets.length} wallets of type "${type}"`);
      return wallets as Wallet[];
    } catch (error) {
      console.error(`❌ Error getting wallets by type "${type}" for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene wallets por currency
   */
  async getWalletsByCurrency(userId: string, currency: string): Promise<Wallet[]> {
    try {
      console.log(`💱 Getting wallets with currency "${currency}" for user ${userId}`);
      
      const wallets = await this.firestoreService.getDocuments(
        this.getCollectionName(userId),
        {
          where: [{ field: "currency", operator: "==", value: currency }],
          orderBy: [{ field: "balance", direction: "desc" }]
        }
      );

      console.log(`📊 Found ${wallets.length} wallets with currency "${currency}"`);
      return wallets as Wallet[];
    } catch (error) {
      console.error(`❌ Error getting wallets by currency "${currency}" for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene wallets con balance mayor a una cantidad
   */
  async getWalletsWithMinBalance(userId: string, minBalance: number): Promise<Wallet[]> {
    try {
      console.log(`💰 Getting wallets with balance >= ${minBalance} for user ${userId}`);
      
      const wallets = await this.firestoreService.getDocuments(
        this.getCollectionName(userId),
        {
          where: [{ field: "balance", operator: ">=", value: minBalance }],
          orderBy: [{ field: "balance", direction: "desc" }]
        }
      );

      console.log(`📊 Found ${wallets.length} wallets with balance >= ${minBalance}`);
      return wallets as Wallet[];
    } catch (error) {
      console.error(`❌ Error getting wallets with min balance ${minBalance} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el balance de una wallet
   */
  async updateBalance(userId: string, walletId: number, newBalance: number): Promise<boolean> {
    try {
      console.log(`💰 Updating balance of wallet ${walletId} to ${newBalance} for user ${userId}`);
      
      const success = await this.updateWallet(userId, walletId, { balance: newBalance });
      
      if (success) {
        console.log(`✅ Balance updated successfully`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error updating balance for wallet ${walletId}:`, error);
      throw error;
    }
  }

  /**
   * Incrementa el balance de una wallet
   */
  async incrementBalance(userId: string, walletId: number, amount: number): Promise<boolean> {
    try {
      console.log(`📈 Incrementing balance of wallet ${walletId} by ${amount} for user ${userId}`);
      
      const success = await this.firestoreService.incrementField(
        this.getCollectionName(userId),
        walletId.toString(),
        "balance",
        amount
      );

      if (success) {
        console.log(`✅ Balance incremented successfully`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error incrementing balance for wallet ${walletId}:`, error);
      throw error;
    }
  }

  /**
   * Busca wallets por nombre
   */
  async searchWalletsByName(userId: string, searchTerm: string): Promise<Wallet[]> {
    try {
      console.log(`🔍 Searching wallets by name "${searchTerm}" for user ${userId}`);
      
      const wallets = await this.firestoreService.searchDocuments(
        this.getCollectionName(userId),
        "name",
        searchTerm,
        {
          orderBy: [{ field: "createdAt", direction: "desc" }],
          limit: 20
        }
      );

      console.log(`📊 Found ${wallets.length} wallets matching "${searchTerm}"`);
      return wallets as Wallet[];
    } catch (error) {
      console.error(`❌ Error searching wallets by name "${searchTerm}" for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el balance total de todas las wallets de un usuario por currency
   */
  async getTotalBalanceByCurrency(userId: string, currency: string): Promise<number> {
    try {
      console.log(`💰 Calculating total balance for currency "${currency}" for user ${userId}`);
      
      const wallets = await this.getWalletsByCurrency(userId, currency);
      const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
      
      console.log(`📊 Total balance for ${currency}: ${totalBalance}`);
      return totalBalance;
    } catch (error) {
      console.error(`❌ Error calculating total balance for currency "${currency}":`, error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Verifica si existe una wallet con un nombre específico
   */
  async walletNameExists(userId: string, name: string, excludeId?: number): Promise<boolean> {
    try {
      const wallets = await this.firestoreService.getDocuments(
        this.getCollectionName(userId),
        {
          where: [{ field: "name", operator: "==", value: name }],
          limit: 1
        }
      );

      if (excludeId && wallets.length > 0) {
        return wallets[0].id !== excludeId;
      }

      return wallets.length > 0;
    } catch (error) {
      console.error(`❌ Error checking wallet name existence:`, error);
      return false;
    }
  }

  /**
   * Cuenta el número total de wallets del usuario
   */
  async getWalletCount(userId: string): Promise<number> {
    try {
      const count = await this.firestoreService.getDocumentCount(
        this.getCollectionName(userId)
      );
      
      console.log(`🔢 User ${userId} has ${count} wallets`);
      return count;
    } catch (error) {
      console.error(`❌ Error getting wallet count for user ${userId}:`, error);
      throw error;
    }
  }
}