import { User } from "@/domain/entities/User";
import { RegisterUserInputDTO } from "@/infrastructure/persistence/firestore/dtos/UserFirestoreDTO";

/**
 * Interfaz para el caso de uso de registro de usuario
 */
export interface IRegisterUserUseCase {
  execute(input: RegisterUserInputDTO): Promise<User>;
}
