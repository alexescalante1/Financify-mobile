import { CurrencyType } from "@/domain/types/CurrencyType";
import { GenderType } from "@/domain/types/GenderType";
import { StatusType } from "@/domain/types/StatusType";

/**
 * DTO para persistencia de User en Firestore
 * Mapea 1:1 con la entidad User del dominio
 * Colección: users/{userId}
 */
export interface UserFirestoreDTO {
  id: string;
  email: string;
  fullName: string;
  gender: GenderType;
  birthDate: string;
  currency: CurrencyType;
  language: string;
  country: {
    code: string;
    name: string;
  };
  preferences: {
    notificationsEnabled: boolean;
    defaultWalletId: string | null;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
  status: StatusType;
}

/**
 * DTO para el input de registro de usuario
 */
export interface RegisterUserInputDTO {
  email: string;
  password: string;
  fullName: string;
  gender: GenderType;
  birthDate: Date;
  currency: CurrencyType;
}
