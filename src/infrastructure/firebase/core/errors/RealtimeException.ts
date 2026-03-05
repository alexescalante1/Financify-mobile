// Excepciones tipadas de Firebase Realtime Database

export type RealtimeException =
  | { code: 'realtime/not-found'; message: string }
  | { code: 'realtime/permission-denied'; message: string }
  | { code: 'realtime/unavailable'; message: string }
  | { code: 'realtime/disconnected'; message: string }
  | { code: 'realtime/write-canceled'; message: string }
  | { code: 'realtime/unknown'; message: string };

export const mapRealtimeError = (error: unknown): RealtimeException => {
  const err = error as { code?: string; message?: string } | null;
  const code = err?.code || 'realtime/unknown';
  const messageMap: Record<string, string> = {
    'PERMISSION_DENIED': 'Sin permisos para esta operacion',
    'DISCONNECTED': 'Desconectado del servidor',
    'NETWORK_ERROR': 'Error de red, verifica tu conexion',
    'WRITE_CANCELED': 'Escritura cancelada por reglas de seguridad',
  };

  const normalizedCode = code.replace('realtime/', '').toUpperCase();
  const mappedCode = messageMap[normalizedCode]
    ? `realtime/${normalizedCode.toLowerCase().replace(/_/g, '-')}`
    : 'realtime/unknown';

  return {
    code: mappedCode as RealtimeException['code'],
    message: messageMap[normalizedCode] || `Error de Realtime DB: ${err?.message || code}`,
  };
};
