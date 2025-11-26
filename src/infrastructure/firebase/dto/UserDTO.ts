import { CurrencyType } from "@/domain/types/CurrencyType";
import { GenderType } from "@/domain/types/GenderType";
import { StatusType } from "@/domain/types/StatusType";

/**
 * DTO para persistir User en Firestore
 * Representa la estructura exacta de los documentos en la colección 'users'
 */
export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  gender: GenderType;
  birthDate: string; // ISO string format
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
    createdAt: string; // ISO string format
    updatedAt: string; // ISO string format
  };
  status: StatusType;
}
