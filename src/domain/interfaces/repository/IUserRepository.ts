import { User } from "@/domain/entities/User";

/**
 * Interfaz del repositorio de User
 * Define el contrato para operaciones de persistencia de usuarios
 * Pertenece a la capa de dominio (independiente de la implementación)
 */
export interface IUserRepository {
  /**
   * Crea un nuevo usuario
   */
  create(user: User): Promise<void>;

  /**
   * Obtiene un usuario por ID
   */
  getById(userId: string): Promise<User | null>;

  /**
   * Actualiza un usuario existente
   */
  update(userId: string, updates: Partial<User>): Promise<void>;

  /**
   * Verifica si un usuario existe
   */
  exists(userId: string): Promise<boolean>;
}
