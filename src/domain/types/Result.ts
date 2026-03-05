// Tipo Result generico (equivalente a Result<T> en Kotlin)
// Envuelve operaciones que pueden fallar de forma tipada

import { AuthError } from '@/domain/errors/AuthErrors';
import { TransactionError } from '@/domain/errors/TransactionErrors';
import { WalletError } from '@/domain/errors/WalletErrors';

export type AppError = AuthError | TransactionError | WalletError;

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

// Helper functions para crear Results
export const Result = {
  ok: <T>(data: T): Result<T> => ({ success: true, data }),

  fail: <T>(error: AppError): Result<T> => ({ success: false, error }),

  isOk: <T>(result: Result<T>): result is { success: true; data: T } =>
    result.success === true,

  isFail: <T>(result: Result<T>): result is { success: false; error: AppError } =>
    result.success === false,

  // Unwrap: obtiene el data o lanza el AppError original preservando el tipo
  unwrap: <T>(result: Result<T>): T => {
    if (result.success) return result.data;
    throw result.error;
  },

  // Map: transforma el data si es exitoso
  map: <T, U>(result: Result<T>, fn: (data: T) => U): Result<U> => {
    if (result.success) return Result.ok(fn(result.data));
    return Result.fail<U>(result.error);
  },
};
