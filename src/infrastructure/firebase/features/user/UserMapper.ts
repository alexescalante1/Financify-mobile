import { User } from "@/domain/entities/User";
import { UserUpdateVo } from "@/domain/valueObjects/UserUpdateVo";
import { UserDTO } from "./UserDTO";

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
   * Convierte UserUpdateVo a Partial<UserDTO> de forma segura
   */
  static toPartialDTO(updates: UserUpdateVo): Partial<UserDTO> {
    const dto: Partial<UserDTO> = {};
    if (updates.fullName !== undefined) dto.fullName = updates.fullName;
    if (updates.gender !== undefined) dto.gender = updates.gender;
    if (updates.birthDate !== undefined) dto.birthDate = updates.birthDate;
    if (updates.currency !== undefined) dto.currency = updates.currency;
    if (updates.language !== undefined) dto.language = updates.language;
    if (updates.country !== undefined) dto.country = { code: updates.country.code, name: updates.country.name };
    if (updates.preferences !== undefined) dto.preferences = {
      notificationsEnabled: updates.preferences.notificationsEnabled!,
      defaultWalletId: updates.preferences.defaultWalletId!,
    };
    if (updates.status !== undefined) dto.status = updates.status;
    return dto;
  }

  /**
   * Convierte un array de DTOs a entidades de dominio
   */
  static toDomainList(dtos: UserDTO[]): User[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
