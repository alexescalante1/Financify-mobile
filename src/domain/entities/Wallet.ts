import { CurrencyType } from "@/domain/types/CurrencyType";

// Representa una billetera o cuenta bancaria que almacena dinero del usuario
export interface Wallet {
  id?: number;
  name: string;
  description: string;
  _idType: number;
  _idAssetType: number;
  balance: number;
  currency: CurrencyType;
  createdAt: Date;
  isPrimary: boolean;
}

/*
const walletBCP: Wallet = {
  id: 1,
  name: "Cuenta BCP",
  description: "Cuentas corrientes",
  type: "cuentaBancaria", // En duro, constante
  assetTypeId: "activoCorriente",
  balance: 3200,
  currency: "PEN",
  isPrimary: false,
  createdAt: "2025-07-17"
};
*/
