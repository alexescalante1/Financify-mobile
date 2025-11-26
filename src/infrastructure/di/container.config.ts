import { container } from "tsyringe";

// ============================================
// DAOs - Resolución automática con @injectable()
// ============================================
import { UserFirestoreDAO } from "@/infrastructure/persistence/firestore/daos/UserFirestoreDAO";
import { WalletFirestoreDAO } from "@/infrastructure/persistence/firestore/daos/WalletFirestoreDAO";

container.registerSingleton(UserFirestoreDAO);
container.registerSingleton(WalletFirestoreDAO);

// ============================================
// Repositories - Resolución automática con @injectable()
// ============================================
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { UserRepositoryImpl } from "@/infrastructure/persistence/firestore/repositories/UserRepositoryImpl";

import { IWalletRepository as IWalletRepo } from "@/domain/repositories/IWalletRepository";
import { WalletRepositoryImpl } from "@/infrastructure/persistence/firestore/repositories/WalletRepositoryImpl";

// Registrar con el token de string para inyectar en Use Cases
container.registerSingleton<IUserRepository>("IUserRepository", UserRepositoryImpl);
container.registerSingleton<IWalletRepo>("IWalletRepo", WalletRepositoryImpl);

// ============================================
// Use Cases - Resolución automática con @injectable()
// ============================================
import { RegisterUserUseCase } from "@/application/useCases/RegisterUserUseCase";

container.registerSingleton(RegisterUserUseCase);

export { container };
