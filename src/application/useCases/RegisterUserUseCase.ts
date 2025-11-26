import { injectable, container } from "tsyringe";
import { User } from "@/domain/entities/User";
import { Wallet } from "@/domain/entities/Wallet";
import { IRegisterUserUseCase } from "@/domain/useCases/IRegisterUserUseCase";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IWalletRepository } from "@/domain/repositories/IWalletRepository";
import { RegisterUserInputDTO } from "@/infrastructure/persistence/firestore/dtos/UserFirestoreDTO";

/**
 * Caso de uso: Registrar un nuevo usuario
 * Orquesta la creación del usuario y su wallet por defecto
 */
@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly walletRepository: IWalletRepository;

  constructor() {
    this.userRepository = container.resolve<IUserRepository>("IUserRepository");
    this.walletRepository = container.resolve<IWalletRepository>("IWalletRepository");
  }

  async execute(input: RegisterUserInputDTO): Promise<User> {
    try {
      // 1. Registrar usuario (Firebase Auth + Firestore)
      const user = await this.userRepository.registerWithAuth(input);

      // 2. Crear wallet por defecto
      const defaultWallet = this.createDefaultWallet(input.currency);
      await this.walletRepository.create(user.id, defaultWallet);

      console.log(`✅ Usuario registrado: ${user.id}`);

      return user;
    } catch (error: any) {
      console.error("❌ Error en RegisterUserUseCase:", error);

      // Mapear errores de Firebase a mensajes legibles
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Este email ya está registrado");
      } else if (error.code === "auth/weak-password") {
        throw new Error("La contraseña es muy débil");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Email inválido");
      }

      throw error;
    }
  }

  private createDefaultWallet(currency: string): Wallet {
    return {
      name: "Billetera Principal",
      description:
        "Esta billetera concentra tus gastos y egresos, mostrando tu estado financiero actual en efectivo y cuentas bancarias.",
      _idType: 1,
      _idAssetType: 1,
      balance: 0,
      currency: currency as any,
      isPrimary: true,
      createdAt: new Date(),
    };
  }
}
