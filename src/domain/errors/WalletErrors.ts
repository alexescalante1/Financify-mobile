// Errores tipados de wallets

export type WalletError =
  | { type: 'WALLET_NOT_FOUND'; message: string }
  | { type: 'WALLET_ALREADY_EXISTS'; message: string }
  | { type: 'INSUFFICIENT_BALANCE'; message: string }
  | { type: 'INVALID_WALLET_DATA'; message: string }
  | { type: 'UNKNOWN_WALLET_ERROR'; message: string };

export const WalletErrors = {
  notFound: (msg = 'Billetera no encontrada'): WalletError => ({
    type: 'WALLET_NOT_FOUND',
    message: msg,
  }),
  alreadyExists: (msg = 'La billetera ya existe'): WalletError => ({
    type: 'WALLET_ALREADY_EXISTS',
    message: msg,
  }),
  insufficientBalance: (msg = 'Saldo insuficiente'): WalletError => ({
    type: 'INSUFFICIENT_BALANCE',
    message: msg,
  }),
  invalidData: (msg = 'Datos de billetera inválidos'): WalletError => ({
    type: 'INVALID_WALLET_DATA',
    message: msg,
  }),
  unknown: (msg = 'Error desconocido en billetera'): WalletError => ({
    type: 'UNKNOWN_WALLET_ERROR',
    message: msg,
  }),
} as const;
