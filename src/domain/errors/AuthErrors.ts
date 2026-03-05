// Errores tipados de autenticacion (equivalente a sealed class en Kotlin)
// Patron: Discriminated union con campo 'type' para pattern matching

export type AuthError =
  | { type: 'INVALID_CREDENTIALS'; message: string }
  | { type: 'USER_NOT_FOUND'; message: string }
  | { type: 'EMAIL_ALREADY_IN_USE'; message: string }
  | { type: 'WEAK_PASSWORD'; message: string }
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'NOT_AUTHENTICATED'; message: string }
  | { type: 'GOOGLE_AUTH_FAILED'; message: string }
  | { type: 'SESSION_EXPIRED'; message: string }
  | { type: 'UNKNOWN_AUTH_ERROR'; message: string };

// Factory functions para crear errores tipados
export const AuthErrors = {
  invalidCredentials: (msg = 'Email o contraseña incorrectos'): AuthError => ({
    type: 'INVALID_CREDENTIALS',
    message: msg,
  }),
  userNotFound: (msg = 'Usuario no encontrado'): AuthError => ({
    type: 'USER_NOT_FOUND',
    message: msg,
  }),
  emailAlreadyInUse: (msg = 'El email ya está registrado'): AuthError => ({
    type: 'EMAIL_ALREADY_IN_USE',
    message: msg,
  }),
  weakPassword: (msg = 'La contraseña es demasiado débil'): AuthError => ({
    type: 'WEAK_PASSWORD',
    message: msg,
  }),
  networkError: (msg = 'Error de conexión a internet'): AuthError => ({
    type: 'NETWORK_ERROR',
    message: msg,
  }),
  notAuthenticated: (msg = 'No hay sesión activa'): AuthError => ({
    type: 'NOT_AUTHENTICATED',
    message: msg,
  }),
  googleAuthFailed: (msg = 'Error en autenticación con Google'): AuthError => ({
    type: 'GOOGLE_AUTH_FAILED',
    message: msg,
  }),
  sessionExpired: (msg = 'La sesión ha expirado'): AuthError => ({
    type: 'SESSION_EXPIRED',
    message: msg,
  }),
  unknown: (msg = 'Error desconocido de autenticación'): AuthError => ({
    type: 'UNKNOWN_AUTH_ERROR',
    message: msg,
  }),
} as const;
