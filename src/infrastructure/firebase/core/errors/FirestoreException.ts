// Excepciones tipadas de Firestore

export type FirestoreException =
  | { code: 'firestore/not-found'; message: string }
  | { code: 'firestore/permission-denied'; message: string }
  | { code: 'firestore/unavailable'; message: string }
  | { code: 'firestore/deadline-exceeded'; message: string }
  | { code: 'firestore/already-exists'; message: string }
  | { code: 'firestore/unknown'; message: string };

export const mapFirestoreError = (error: unknown): FirestoreException => {
  const err = error as { code?: string; message?: string } | null;
  const code = err?.code || 'firestore/unknown';
  const messageMap: Record<string, string> = {
    'not-found': 'Documento no encontrado',
    'permission-denied': 'Sin permisos para esta operacion',
    'unavailable': 'Servicio no disponible, intenta mas tarde',
    'deadline-exceeded': 'La operacion tardo demasiado',
    'already-exists': 'El documento ya existe',
  };

  const mappedCode = `firestore/${code.replace('firestore/', '')}`;
  return {
    code: mappedCode as FirestoreException['code'],
    message: messageMap[code] || `Error de Firestore: ${err?.message || code}`,
  };
};
