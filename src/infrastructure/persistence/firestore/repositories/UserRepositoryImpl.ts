import { injectable } from "tsyringe";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/infrastructure/firebase/FirebaseConfiguration";
import { User } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { UserFirestoreDAO } from "../daos/UserFirestoreDAO";
import { UserFirestoreMapper } from "../mappers/UserFirestoreMapper";
import { RegisterUserInputDTO } from "../dtos/UserFirestoreDTO";

/**
 * Implementación del repositorio de User usando Firestore
 * Coordina Firebase Auth, DAO y Mapper
 */
@injectable()
export class UserRepositoryImpl implements IUserRepository {
  private readonly dao: UserFirestoreDAO;

  constructor() {
    this.dao = new UserFirestoreDAO();
  }

  async registerWithAuth(input: RegisterUserInputDTO): Promise<User> {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      input.email,
      input.password
    );

    const userId = userCredential.user.uid;
    const now = new Date().toISOString();

    // 2. Crear entidad User con valores por defecto
    const user: User = {
      id: userId,
      email: input.email,
      fullName: input.fullName,
      gender: input.gender,
      birthDate: input.birthDate.toISOString().split("T")[0],
      currency: input.currency,
      language: "es",
      country: {
        code: "PE",
        name: "Perú",
      },
      preferences: {
        notificationsEnabled: true,
        defaultWalletId: null,
      },
      metadata: {
        createdAt: now,
        updatedAt: now,
      },
      status: "active",
    };

    // 3. Guardar en Firestore usando DAO
    await this.save(user);

    return user;
  }

  async save(user: User): Promise<void> {
    const dto = UserFirestoreMapper.toFirestore(user);
    await this.dao.save(dto);
  }

  async findById(userId: string): Promise<User | null> {
    const dto = await this.dao.findById(userId);
    if (!dto) return null;
    return UserFirestoreMapper.toDomain(dto);
  }

  async exists(userId: string): Promise<boolean> {
    return await this.dao.exists(userId);
  }
}
