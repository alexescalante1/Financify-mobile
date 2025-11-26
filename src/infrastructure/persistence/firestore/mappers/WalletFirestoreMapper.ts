import { Wallet } from "@/domain/entities/Wallet";
import { WalletFirestoreDTO } from "../dtos/WalletFirestoreDTO";

/**
 * Mapper bidireccional entre Wallet (entidad de dominio) y WalletFirestoreDTO
 * Respeta la estructura de la entidad Wallet
 */
export class WalletFirestoreMapper {
  /**
   * Convierte de entidad Wallet a DTO de Firestore
   */
  static toFirestore(entity: Wallet): WalletFirestoreDTO {
    return {
      id: entity.id!,
      name: entity.name,
      description: entity.description,
      _idType: entity._idType,
      _idAssetType: entity._idAssetType,
      balance: entity.balance,
      currency: entity.currency,
      createdAt: entity.createdAt.toISOString(),
      isPrimary: entity.isPrimary,
    };
  }

  /**
   * Convierte de DTO de Firestore a entidad Wallet
   */
  static toDomain(dto: WalletFirestoreDTO): Wallet {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      _idType: dto._idType,
      _idAssetType: dto._idAssetType,
      balance: dto.balance,
      currency: dto.currency,
      createdAt: new Date(dto.createdAt),
      isPrimary: dto.isPrimary,
    };
  }
}
