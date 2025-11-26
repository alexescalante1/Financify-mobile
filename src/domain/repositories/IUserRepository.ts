import { User } from "@/domain/entities/User";
import { RegisterUserInputDTO } from "@/infrastructure/persistence/firestore/dtos/UserFirestoreDTO";

/**
 * Contrato del repositorio de User (capa de dominio)
 * Define las operaciones de persistencia sin depender de la implementación
 */
export interface IUserRepository {
  /**
   * Registra un nuevo usuario con Firebase Auth y Firestore
   */
  registerWithAuth(input: RegisterUserInputDTO): Promise<User>;

  /**
   * Guarda un usuario en la base de datos
   */
  save(user: User): Promise<void>;

  /**
   * Busca un usuario por ID
   */
  findById(userId: string): Promise<User | null>;

  /**
   * Verifica si un usuario existe
   */
  exists(userId: string): Promise<boolean>;
}
