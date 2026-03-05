import { User } from '@/domain/entities/User';
import { UserUpdateVo } from '@/domain/valueObjects/UserUpdateVo';

// Contrato consolidado del repositorio de User (capa de dominio)
// Operaciones de persistencia de datos de usuario

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(userId: string): Promise<User | null>;
  update(userId: string, updates: UserUpdateVo): Promise<void>;
  exists(userId: string): Promise<boolean>;
}
