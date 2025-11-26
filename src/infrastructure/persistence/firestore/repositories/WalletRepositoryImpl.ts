import { injectable } from "tsyringe";
import { Wallet } from "@/domain/entities/Wallet";
import { IWalletRepository } from "@/domain/repositories/IWalletRepository";
import { WalletFirestoreDAO } from "../daos/WalletFirestoreDAO";
import { WalletFirestoreMapper } from "../mappers/WalletFirestoreMapper";

/**
 * Implementación del repositorio de Wallet usando Firestore
 * Coordina DAO y Mapper
 */
@injectable()
export class WalletRepositoryImpl implements IWalletRepository {
  private readonly dao: WalletFirestoreDAO;

  constructor() {
    this.dao = new WalletFirestoreDAO();
  }

  async create(userId: string, wallet: Wallet): Promise<Wallet> {
    // 1. Obtener siguiente ID
    const nextId = await this.dao.getNextId(userId);

    // 2. Asignar ID y fecha de creación
    const walletWithId: Wallet = {
      ...wallet,
      id: nextId,
      createdAt: new Date(),
    };

    // 3. Guardar en Firestore
    const dto = WalletFirestoreMapper.toFirestore(walletWithId);
    await this.dao.save(userId, dto);

    return walletWithId;
  }

  async findById(userId: string, walletId: number): Promise<Wallet | null> {
    const dto = await this.dao.findById(userId, walletId);
    if (!dto) return null;
    return WalletFirestoreMapper.toDomain(dto);
  }

  async findAll(userId: string): Promise<Wallet[]> {
    const dtos = await this.dao.findAll(userId);
    return dtos.map(WalletFirestoreMapper.toDomain);
  }

  async findPrimary(userId: string): Promise<Wallet | null> {
    const dto = await this.dao.findPrimary(userId);
    if (!dto) return null;
    return WalletFirestoreMapper.toDomain(dto);
  }
}
