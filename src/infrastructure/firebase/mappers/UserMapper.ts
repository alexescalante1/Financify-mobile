import { User } from "@/domain/entities/User";
import { UserDTO } from "../dto/UserDTO";

/**
 * Mapper bidireccional entre User (entidad de dominio) y UserDTO (persistencia)
 * Implementa el patrón Mapper para separar la capa de dominio de la capa de datos
 */
export class UserMapper {
  /**
   * Convierte de entidad de dominio a DTO de Firestore
   */
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      gender: user.gender,
      birthDate: user.birthDate,
      currency: user.currency,
      language: user.language,
      country: {
        code: user.country.code,
        name: user.country.name,
      },
      preferences: {
        notificationsEnabled: user.preferences.notificationsEnabled,
        defaultWalletId: user.preferences.defaultWalletId,
      },
      metadata: {
        createdAt: user.metadata.createdAt,
        updatedAt: user.metadata.updatedAt,
      },
      status: user.status,
    };
  }

  /**
   * Convierte de DTO de Firestore a entidad de dominio
   */
  static toDomain(dto: UserDTO): User {
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

  /**
   * Convierte un array de DTOs a entidades de dominio
   */
  static toDomainList(dtos: UserDTO[]): User[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
