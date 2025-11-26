import { User } from "@/domain/entities/User";
import { UserFirestoreDTO } from "../dtos/UserFirestoreDTO";

/**
 * Mapper bidireccional entre User (entidad de dominio) y UserFirestoreDTO
 * Respeta la estructura de la entidad User
 */
export class UserFirestoreMapper {
  /**
   * Convierte de entidad User a DTO de Firestore
   */
  static toFirestore(entity: User): UserFirestoreDTO {
    return {
      id: entity.id,
      email: entity.email,
      fullName: entity.fullName,
      gender: entity.gender,
      birthDate: entity.birthDate,
      currency: entity.currency,
      language: entity.language,
      country: {
        code: entity.country.code,
        name: entity.country.name,
      },
      preferences: {
        notificationsEnabled: entity.preferences.notificationsEnabled,
        defaultWalletId: entity.preferences.defaultWalletId,
      },
      metadata: {
        createdAt: entity.metadata.createdAt,
        updatedAt: entity.metadata.updatedAt,
      },
      status: entity.status,
    };
  }

  /**
   * Convierte de DTO de Firestore a entidad User
   */
  static toDomain(dto: UserFirestoreDTO): User {
    return {
      id: dto.id,
      email: dto.email,
      fullName: dto.fullName,
      gender: dto.gender,
      birthDate: dto.birthDate,
      currency: dto.currency,
      language: dto.language,
      country: {
        code: dto.country.code,
        name: dto.country.name,
      },
      preferences: {
        notificationsEnabled: dto.preferences.notificationsEnabled,
        defaultWalletId: dto.preferences.defaultWalletId,
      },
      metadata: {
        createdAt: dto.metadata.createdAt,
        updatedAt: dto.metadata.updatedAt,
      },
      status: dto.status,
    };
  }
}
