import { Wallet } from "@/domain/entities/Wallet";

/**
 * Contrato del repositorio de Wallet (capa de dominio)
 * Define las operaciones de persistencia sin depender de la implementación
 */
export interface IWalletRepository {
  /**
   * Crea una nueva wallet
   */
  create(userId: string, wallet: Wallet): Promise<Wallet>;

  /**
   * Busca una wallet por ID
   */
  findById(userId: string, walletId: number): Promise<Wallet | null>;

  /**
   * Obtiene todas las wallets de un usuario
   */
  findAll(userId: string): Promise<Wallet[]>;

  /**
   * Obtiene la wallet primaria
   */
  findPrimary(userId: string): Promise<Wallet | null>;
}
