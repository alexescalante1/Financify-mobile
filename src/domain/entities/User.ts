import { CurrencyType } from "@/domain/types/CurrencyType";
import { GenderType } from "@/domain/types/GenderType";
import { StatusType } from "@/domain/types/StatusType";

// Representa a un usuario del sistema con su configuración base y preferencias
export interface User {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly gender: GenderType | null;
  readonly birthDate: string | null; // ISO string format
  readonly currency: CurrencyType;
  readonly language: string;
  readonly country: {
    readonly code: string;
    readonly name: string;
  };
  readonly preferences: {
    readonly notificationsEnabled: boolean;
    readonly defaultWalletId: string | null;
  };
  readonly metadata: {
    readonly createdAt: string; // ISO string format
    readonly updatedAt: string; // ISO string format
  };
  readonly status: StatusType;
}
