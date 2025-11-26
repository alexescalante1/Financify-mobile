import { injectable, container } from "tsyringe";
import { IAuthRepository } from "@/domain/repository/IAuthRepository";
import { IWalletRepository } from "@/domain/interfaces/repository/IWalletRepository";
import { User } from "@/domain/models/User";
import { Wallet } from "@/domain/entities/Wallet";
import { UserRegistrationVo } from "@/domain/valueObjects/UserRegistrationVo";
import { CurrencyType } from "@/domain/types/CurrencyType";

/**
 * Caso de uso para registrar un nuevo usuario
 * Implementa la lógica de negocio de registro siguiendo Clean Architecture
 *
 * Responsabilidades:
 * 1. Crear usuario en Firebase Auth y Firestore
 * 2. Crear wallet por defecto para el usuario
 * 3. Retornar el usuario creado
 */
@injectable()
export class RegisterUserUseCase {
  private readonly authRepository: IAuthRepository;
  private readonly walletRepository: IWalletRepository;

  constructor() {
    this.authRepository = container.resolve<IAuthRepository>("IAuthRepository");
    this.walletRepository =
      container.resolve<IWalletRepository>("IWalletRepository");
  }

  /**
   * Ejecuta el caso de uso de registro
   */
  async execute(userData: UserRegistrationVo): Promise<User> {
    try {
      // 1. Crear usuario en Firebase Auth y Firestore
      const newUser = await this.authRepository.register(userData);

      // 2. Crear wallet por defecto
      const defaultWallet: Wallet = this.createDefaultWallet(
        userData.currency as CurrencyType
      );

      await this.walletRepository.register(newUser.id, defaultWallet);

      console.log(`✅ Usuario registrado exitosamente: ${newUser.id}`);

      // 3. Retornar el usuario creado
      return newUser;
    } catch (error: any) {
      console.error("❌ Error en RegisterUserUseCase:", error);

      // Re-lanzar el error con un mensaje más claro
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

  /**
   * Crea una wallet por defecto con valores predeterminados
   */
  private createDefaultWallet(currency: CurrencyType): Wallet {
    return {
      name: "Billetera Principal",
      description:
        "Esta billetera concentra tus gastos y egresos, mostrando tu estado financiero actual en efectivo y cuentas bancarias.",
      _idType: 1,
      _idAssetType: 1,
      balance: 0,
      currency: currency,
      isPrimary: true,
      createdAt: new Date(),
    };
  }
}
