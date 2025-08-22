import { CurrencyType } from "@/domain/types/CurrencyType";
import { GenderType } from "@/domain/types/GenderType";
import { StatusType } from "@/domain/types/StatusType";

export interface User {
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