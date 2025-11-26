import { Wallet } from "@/domain/entities/Wallet";
import { WalletDTO } from "../dto/WalletDTO";

/**
 * Mapper bidireccional entre Wallet (entidad de dominio) y WalletDTO (persistencia)
 * Implementa el patrón Mapper para separar la capa de dominio de la capa de datos
 */
export class WalletMapper {
  /**
   * Convierte de entidad de dominio a DTO de Firestore
   */
  static toDTO(wallet: Wallet): WalletDTO {
    return {
      id: wallet.id!,
      name: wallet.name,
      description: wallet.description,
      _idType: wallet._idType,
      _idAssetType: wallet._idAssetType,
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.createdAt instanceof Date
        ? wallet.createdAt.toISOString()
        : wallet.createdAt.toString(),
      isPrimary: wallet.isPrimary,
    };
  }

  /**
   * Convierte de DTO de Firestore a entidad de dominio
   */
  static toDomain(dto: WalletDTO): Wallet {
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

  /**
   * Convierte un array de DTOs a entidades de dominio
   */
  static toDomainList(dtos: WalletDTO[]): Wallet[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
