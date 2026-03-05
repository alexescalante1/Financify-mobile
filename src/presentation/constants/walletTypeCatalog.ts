import { WalletTypeCatalogItem } from '@/domain/constants/WalletTypeCatalogItem';

export const walletTypeCatalog: WalletTypeCatalogItem[] = [
  {
    id: 1,
    value: "special",
    label: "Activo Líquido Consolidado",
    description:
      "Billetera de control usada para consolidar todo el dinero líquido del usuario: efectivo, billeteras digitales y saldos en cuentas. Es el centro de cuadres y refleja el estado financiero real.",
  },
  {
    id: 2,
    value: "bankAccount",
    label: "Cuenta Bancaria",
    description:
      "Cuenta tradicional como BCP, BBVA, Interbank u otras entidades bancarias.",
  },
  {
    id: 3,
    value: "salaryAccount",
    label: "Cuenta Sueldo",
    description: "Cuenta destinada al abono mensual del salario.",
  },
  {
    id: 4,
    value: "savingsAccount",
    label: "Cuenta de Ahorros",
    description:
      "Cuenta destinada al ahorro de largo plazo, con baja rotación.",
  },
  {
    id: 5,
    value: "severanceAccount",
    label: "Cuenta CTS",
    description:
      "Cuenta específica para Compensación por Tiempo de Servicios (Perú).",
  },
  {
    id: 6,
    value: "investmentAccount",
    label: "Cuenta de Inversión",
    description:
      "Cuenta vinculada a inversiones en bolsa, fondos mutuos u otros productos.",
  },
  {
    id: 7,
    value: "mutualFund",
    label: "Fondo Mutuo",
    description:
      "Instrumento financiero colectivo que permite invertir en múltiples activos.",
  },
  {
    id: 8,
    value: "digitalWallet",
    label: "Billetera Digital",
    description: "Plataformas como Yape, Plin, Paypal u otras similares.",
  },
  {
    id: 9,
    value: "crypto",
    label: "Billetera Cripto",
    description:
      "Billeteras para criptomonedas como Bitcoin, Ethereum, USDT, etc.",
  },
  {
    id: 10,
    value: "debitCard",
    label: "Tarjeta de Débito",
    description: "Tarjetas que descuentan directamente de una cuenta bancaria.",
  },
  {
    id: 11,
    value: "creditCard",
    label: "Tarjeta de Crédito",
    description:
      "Tarjetas con línea de crédito que permiten compras y pagos diferidos.",
  },
  {
    id: 12,
    value: "cash",
    label: "Efectivo",
    description: "Dinero físico en caja, bolsillo o caja chica.",
  },
  {
    id: 13,
    value: "other",
    label: "Otro",
    description:
      "Otro tipo de cuenta o billetera no clasificada anteriormente.",
  },
];
