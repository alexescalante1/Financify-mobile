// Excepciones tipadas de Firebase Auth
// Mapea errores de Firebase a tipos propios de la aplicacion

export type FirebaseAuthException =
  | { code: 'auth/invalid-credential'; message: string }
  | { code: 'auth/user-not-found'; message: string }
  | { code: 'auth/wrong-password'; message: string }
  | { code: 'auth/email-already-in-use'; message: string }
  | { code: 'auth/weak-password'; message: string }
  | { code: 'auth/network-request-failed'; message: string }
  | { code: 'auth/too-many-requests'; message: string }
  | { code: 'auth/user-disabled'; message: string }
  | { code: 'auth/invalid-email'; message: string }
  | { code: 'auth/unknown'; message: string };

export const mapFirebaseAuthError = (error: unknown): FirebaseAuthException => {
  const err = error as { code?: string; message?: string } | null;
  const code = err?.code || 'auth/unknown';
  const messageMap: Record<string, string> = {
    'auth/invalid-credential': 'Credenciales invalidas',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contrasena incorrecta',
    'auth/email-already-in-use': 'El email ya esta registrado',
    'auth/weak-password': 'La contrasena es muy debil (minimo 6 caracteres)',
    'auth/network-request-failed': 'Error de conexion a internet',
    'auth/too-many-requests': 'Demasiados intentos, intenta mas tarde',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/invalid-email': 'El formato del email es invalido',
  };

  return {
    code: code as FirebaseAuthException['code'],
    message: messageMap[code] || `Error de autenticacion: ${err?.message || code}`,
  };
};
