// Errores tipados de transacciones

export type TransactionError =
  | { type: 'TRANSACTION_NOT_FOUND'; message: string }
  | { type: 'INVALID_AMOUNT'; message: string }
  | { type: 'INVALID_DETAIL'; message: string }
  | { type: 'REGULARIZATION_FAILED'; message: string }
  | { type: 'UNKNOWN_TRANSACTION_ERROR'; message: string };

export const TransactionErrors = {
  notFound: (msg = 'Transacción no encontrada'): TransactionError => ({
    type: 'TRANSACTION_NOT_FOUND',
    message: msg,
  }),
  invalidAmount: (msg = 'El monto es inválido'): TransactionError => ({
    type: 'INVALID_AMOUNT',
    message: msg,
  }),
  invalidDetail: (msg = 'El detalle es inválido'): TransactionError => ({
    type: 'INVALID_DETAIL',
    message: msg,
  }),
  regularizationFailed: (msg = 'Error al regularizar saldo'): TransactionError => ({
    type: 'REGULARIZATION_FAILED',
    message: msg,
  }),
  unknown: (msg = 'Error desconocido en transacción'): TransactionError => ({
    type: 'UNKNOWN_TRANSACTION_ERROR',
    message: msg,
  }),
} as const;
