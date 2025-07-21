import { Unsubscribe } from "firebase/firestore";
import { Wallet } from "@/domain/entities/Wallet";

// ========================================
// MAIN INTERFACE
// ========================================

export interface IWalletRepository {
  // ========================================
  // CRUD BÁSICO
  // ========================================

  /**
   * Registra/crea una nueva wallet
   * @param userId - ID del usuario propietario
   * @param obj - Datos de la wallet a crear
   * @returns Promise con la wallet creada (incluyendo ID generado)
   */
  register(userId: string, obj: Wallet): Promise<Wallet>;

  /**
   * Obtiene una wallet específica por ID
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet
   * @returns Promise con la wallet encontrada o null si no existe
   */
  getWalletById(userId: string, walletId: number): Promise<Wallet | null>;

  /**
   * Obtiene todas las wallets de un usuario
   * @param userId - ID del usuario
   * @returns Promise con array de todas las wallets del usuario
   */
  getAllWallets(userId: string): Promise<Wallet[]>;

  /**
   * Actualiza una wallet existente
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet a actualizar
   * @param updates - Datos parciales a actualizar
   * @returns Promise con boolean indicando éxito de la operación
   */
  updateWallet(userId: string, walletId: number, updates: Partial<Wallet>): Promise<boolean>;

  /**
   * Elimina una wallet
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet a eliminar
   * @returns Promise con boolean indicando éxito de la operación
   */
  deleteWallet(userId: string, walletId: number): Promise<boolean>;

  // ========================================
  // LISTENERS EN TIEMPO REAL
  // ========================================

  /**
   * Escucha wallets por rango de fechas en tiempo real
   * @param userId - ID del usuario
   * @param startDate - Fecha de inicio del rango
   * @param endDate - Fecha de fin del rango
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @returns Función para cancelar la suscripción
   */
  listenToWalletsByDate(
    userId: string,
    startDate: Date,
    endDate: Date,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe;

  /**
   * Escucha todas las wallets de un usuario en tiempo real
   * @param userId - ID del usuario
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @returns Función para cancelar la suscripción
   */
  listenToAllWallets(
    userId: string,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe;

  /**
   * Escucha una wallet específica en tiempo real
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet a escuchar
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @returns Función para cancelar la suscripción
   */
  listenToWallet(
    userId: string,
    walletId: number,
    callback: (wallet: Wallet | null) => void,
    onError?: (error: any) => void
  ): Unsubscribe;

  // ========================================
  // MÉTODOS ESPECÍFICOS DE NEGOCIO
  // ========================================

  /**
   * Obtiene la wallet primaria del usuario
   * @param userId - ID del usuario
   * @returns Promise con la wallet primaria o null si no tiene
   */
  getPrimaryWallet(userId: string): Promise<Wallet | null>;

  /**
   * Establece una wallet como primaria (y quita el flag de las demás)
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet a establecer como primaria
   * @returns Promise con boolean indicando éxito de la operación
   */
  setPrimaryWallet(userId: string, walletId: number): Promise<boolean>;

  /**
   * Obtiene wallets filtradas por tipo
   * @param userId - ID del usuario
   * @param type - Tipo de wallet a filtrar
   * @returns Promise con array de wallets del tipo especificado
   */
  getWalletsByType(userId: string, type: string): Promise<Wallet[]>;

  /**
   * Obtiene wallets filtradas por moneda
   * @param userId - ID del usuario
   * @param currency - Moneda a filtrar
   * @returns Promise con array de wallets de la moneda especificada
   */
  getWalletsByCurrency(userId: string, currency: string): Promise<Wallet[]>;

  /**
   * Obtiene wallets con balance mayor o igual a una cantidad mínima
   * @param userId - ID del usuario
   * @param minBalance - Balance mínimo requerido
   * @returns Promise con array de wallets que cumplen el criterio
   */
  getWalletsWithMinBalance(userId: string, minBalance: number): Promise<Wallet[]>;

  /**
   * Actualiza el balance de una wallet específica
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet
   * @param newBalance - Nuevo balance a establecer
   * @returns Promise con boolean indicando éxito de la operación
   */
  updateBalance(userId: string, walletId: number, newBalance: number): Promise<boolean>;

  /**
   * Incrementa o decrementa el balance de una wallet de forma atómica
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet
   * @param amount - Cantidad a incrementar (negativo para decrementar)
   * @returns Promise con boolean indicando éxito de la operación
   */
  incrementBalance(userId: string, walletId: number, amount: number): Promise<boolean>;

  /**
   * Busca wallets por nombre usando búsqueda de texto
   * @param userId - ID del usuario
   * @param searchTerm - Término de búsqueda
   * @returns Promise con array de wallets que coinciden con la búsqueda
   */
  searchWalletsByName(userId: string, searchTerm: string): Promise<Wallet[]>;

  /**
   * Calcula el balance total de todas las wallets de una moneda específica
   * @param userId - ID del usuario
   * @param currency - Moneda para calcular el total
   * @returns Promise con el balance total en la moneda especificada
   */
  getTotalBalanceByCurrency(userId: string, currency: string): Promise<number>;

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Verifica si existe una wallet con un nombre específico
   * @param userId - ID del usuario
   * @param name - Nombre a verificar
   * @param excludeId - ID opcional a excluir de la verificación
   * @returns Promise con boolean indicando si el nombre ya existe
   */
  walletNameExists(userId: string, name: string, excludeId?: number): Promise<boolean>;

  /**
   * Cuenta el número total de wallets del usuario
   * @param userId - ID del usuario
   * @returns Promise con el número total de wallets
   */
  getWalletCount(userId: string): Promise<number>;
}

// ========================================
// INTERFACES AUXILIARES (OPCIONALES)
// ========================================

/**
 * Opciones para filtrar wallets
 */
export interface WalletFilterOptions {
  type?: string;
  currency?: string;
  minBalance?: number;
  maxBalance?: number;
  isPrimary?: boolean;
  isActive?: boolean;
}

/**
 * Opciones para ordenar wallets
 */
export interface WalletSortOptions {
  field: 'name' | 'balance' | 'createdAt' | 'type' | 'currency';
  direction: 'asc' | 'desc';
}

/**
 * Estadísticas de wallets de un usuario
 */
export interface WalletStats {
  totalWallets: number;
  totalBalanceByCurrency: { [currency: string]: number };
  walletsByType: { [type: string]: number };
  primaryWallet: Wallet | null;
  averageBalance: number;
  lastCreatedWallet: Wallet | null;
}

/**
 * Resultado de operaciones batch en wallets
 */
export interface WalletBatchResult {
  successful: number[];
  failed: Array<{ walletId: number; error: any }>;
  totalOperations: number;
  successCount: number;
  failureCount: number;
}

// ========================================
// EXTENSIÓN OPCIONAL DE LA INTERFAZ PRINCIPAL
// ========================================

/**
 * Interfaz extendida con métodos avanzados opcionales
 */
export interface IWalletRepositoryExtended extends IWalletRepository {
  /**
   * Obtiene wallets con filtros avanzados
   * @param userId - ID del usuario
   * @param filters - Filtros a aplicar
   * @param sort - Opciones de ordenamiento
   * @returns Promise con array de wallets filtradas
   */
  getWalletsWithFilters(
    userId: string,
    filters: WalletFilterOptions,
    sort?: WalletSortOptions
  ): Promise<Wallet[]>;

  /**
   * Obtiene estadísticas completas de las wallets del usuario
   * @param userId - ID del usuario
   * @returns Promise con estadísticas detalladas
   */
  getWalletStats(userId: string): Promise<WalletStats>;

  /**
   * Actualiza múltiples wallets en una operación batch
   * @param userId - ID del usuario
   * @param updates - Array de updates a aplicar
   * @returns Promise con resultado del batch
   */
  updateMultipleWallets(
    userId: string,
    updates: Array<{ walletId: number; data: Partial<Wallet> }>
  ): Promise<WalletBatchResult>;

  /**
   * Transfiere balance entre dos wallets del mismo usuario
   * @param userId - ID del usuario
   * @param fromWalletId - ID de la wallet origen
   * @param toWalletId - ID de la wallet destino
   * @param amount - Cantidad a transferir
   * @returns Promise con boolean indicando éxito de la operación
   */
  transferBalance(
    userId: string,
    fromWalletId: number,
    toWalletId: number,
    amount: number
  ): Promise<boolean>;

  /**
   * Escucha cambios en wallets con filtros específicos
   * @param userId - ID del usuario
   * @param filters - Filtros a aplicar
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @returns Función para cancelar la suscripción
   */
  listenToWalletsWithFilters(
    userId: string,
    filters: WalletFilterOptions,
    callback: (wallets: Wallet[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe;

  /**
   * Archiva una wallet (soft delete)
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet a archivar
   * @returns Promise con boolean indicando éxito de la operación
   */
  archiveWallet(userId: string, walletId: number): Promise<boolean>;

  /**
   * Restaura una wallet archivada
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet a restaurar
   * @returns Promise con boolean indicando éxito de la operación
   */
  restoreWallet(userId: string, walletId: number): Promise<boolean>;

  /**
   * Obtiene wallets archivadas
   * @param userId - ID del usuario
   * @returns Promise con array de wallets archivadas
   */
  getArchivedWallets(userId: string): Promise<Wallet[]>;
}

// ========================================
// EXPORT DEFAULT
// ========================================

export default IWalletRepository;