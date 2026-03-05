import { WalletType } from "@/domain/types/WalletType";

export interface WalletTypeCatalogItem {
  id: number;
  value: WalletType;
  label: string;
  description: string;
}
