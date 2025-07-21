import {
  DatabaseReference,
  Query,
  DataSnapshot,
  Unsubscribe,
} from "firebase/database";

// ========================================
// INTERFACES FOR OPTIONS AND CONFIGURATIONS
// ========================================

interface RealtimeQueryOptions {
  orderBy?: 'child' | 'key' | 'value';
  orderByChild?: string;
  limitToFirst?: number;
  limitToLast?: number;
  startAt?: any;
  endAt?: any;
  equalTo?: any;
  startAfter?: any;
  endBefore?: any;
}

interface ListenerOptions extends RealtimeQueryOptions {
  onlyOnce?: boolean;
  includeMetadata?: boolean;
}

interface BatchOperation {
  operation: 'set' | 'update' | 'remove';
  path: string;
  data?: any;
}

interface BatchResult {
  successful: string[];
  failed: Array<{ path: string; error: any; operation: string }>;
  totalOperations: number;
  successCount: number;
  failureCount: number;
}

interface RealtimeTransaction {
  path: string;
  updateFunction: (currentData: any) => any;
  applyLocally?: boolean;
}

interface TransactionResult {
  committed: boolean;
  snapshot: DataSnapshot | null;
  value: any;
}

interface PaginationState {
  lastKey?: string;
  hasMore: boolean;
  pageSize: number;
}

interface PaginatedResult<T = any> {
  data: T[];
  pagination: PaginationState;
  totalCount?: number;
}

interface ConnectionState {
  connected: boolean;
  serverTimeOffset: number;
}

interface PresenceInfo {
  isOnline: boolean;
  lastSeen: number;
  connections: { [key: string]: any };
}

// ========================================
// MAIN INTERFACE
// ========================================

interface ICompleteRealtimeService {
  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  /**
   * Obtiene datos por path
   * @param path - Ruta en la base de datos
   * @returns Promise con los datos o null si no existen
   */
  getDataByPath(path: string): Promise<any>;

  /**
   * Obtiene datos con opciones de query
   * @param path - Ruta en la base de datos
   * @param options - Opciones de filtrado y ordenamiento
   * @returns Promise con los datos filtrados
   */
  getDataWithQuery(path: string, options: RealtimeQueryOptions): Promise<any>;

  /**
   * Establece datos en un path (sobrescribe)
   * @param path - Ruta donde guardar
   * @param data - Datos a guardar
   * @returns Promise con boolean de éxito
   */
  setDataByPath(path: string, data: any): Promise<boolean>;

  /**
   * Actualiza datos en un path (merge)
   * @param path - Ruta a actualizar
   * @param data - Datos a actualizar
   * @returns Promise con boolean de éxito
   */
  updateDataByPath(path: string, data: any): Promise<boolean>;

  /**
   * Elimina datos de un path
   * @param path - Ruta a eliminar
   * @returns Promise con boolean de éxito
   */
  deleteDataByPath(path: string): Promise<boolean>;

  /**
   * Agrega un nuevo elemento con push key automática
   * @param path - Ruta padre donde agregar
   * @param data - Datos a agregar
   * @returns Promise con la nueva key generada
   */
  pushData(path: string, data: any): Promise<string | null>;

  /**
   * Verifica si existe un path
   * @param path - Ruta a verificar
   * @returns Promise con boolean indicando existencia
   */
  pathExists(path: string): Promise<boolean>;

  // ========================================
  // REAL-TIME LISTENERS
  // ========================================

  /**
   * Escucha cambios en tiempo real en un path
   * @param path - Ruta a escuchar
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones del listener
   * @returns Función para cancelar la suscripción
   */
  listenToPath(
    path: string,
    callback: (data: any, snapshot: DataSnapshot) => void,
    onError?: (error: any) => void,
    options?: ListenerOptions
  ): Unsubscribe;

  /**
   * Escucha cambios de un valor específico
   * @param path - Ruta a escuchar
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @returns Función para cancelar la suscripción
   */
  listenToValue(
    path: string,
    callback: (value: any) => void,
    onError?: (error: any) => void
  ): Unsubscribe;

  /**
   * Escucha cuando se agregan elementos
   * @param path - Ruta a escuchar
   * @param callback - Función que se ejecuta cuando se agrega un elemento
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones de query
   * @returns Función para cancelar la suscripción
   */
  listenToChildAdded(
    path: string,
    callback: (data: any, key: string, prevChildKey?: string | null) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe;

  /**
   * Escucha cuando se cambian elementos
   * @param path - Ruta a escuchar
   * @param callback - Función que se ejecuta cuando se cambia un elemento
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones de query
   * @returns Función para cancelar la suscripción
   */
  listenToChildChanged(
    path: string,
    callback: (data: any, key: string, prevChildKey?: string | null) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe;

  /**
   * Escucha cuando se eliminan elementos
   * @param path - Ruta a escuchar
   * @param callback - Función que se ejecuta cuando se elimina un elemento
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones de query
   * @returns Función para cancelar la suscripción
   */
  listenToChildRemoved(
    path: string,
    callback: (data: any, key: string) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe;

  /**
   * Escucha cuando se mueven elementos (cambio de orden)
   * @param path - Ruta a escuchar
   * @param callback - Función que se ejecuta cuando se mueve un elemento
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones de query
   * @returns Función para cancelar la suscripción
   */
  listenToChildMoved(
    path: string,
    callback: (data: any, key: string, prevChildKey?: string | null) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe;

  // ========================================
  // ADVANCED QUERY OPERATIONS
  // ========================================

  /**
   * Obtiene elementos paginados
   * @param path - Ruta de la colección
   * @param pageSize - Tamaño de página
   * @param startAfterKey - Key para empezar después (paginación)
   * @param options - Opciones adicionales de query
   * @returns Promise con resultado paginado
   */
  getPaginatedData(
    path: string,
    pageSize: number,
    startAfterKey?: string,
    options?: RealtimeQueryOptions
  ): Promise<PaginatedResult>;

  /**
   * Escucha datos paginados en tiempo real
   * @param path - Ruta de la colección
   * @param pageSize - Tamaño de página
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param startAfterKey - Key para empezar después
   * @param options - Opciones adicionales de query
   * @returns Función para cancelar la suscripción
   */
  listenToPaginatedData(
    path: string,
    pageSize: number,
    callback: (result: PaginatedResult) => void,
    onError?: (error: any) => void,
    startAfterKey?: string,
    options?: RealtimeQueryOptions
  ): Unsubscribe;

  /**
   * Busca elementos por valor en un campo específico
   * @param path - Ruta de la colección
   * @param childKey - Campo por el cual buscar
   * @param searchValue - Valor a buscar
   * @param options - Opciones adicionales de query
   * @returns Promise con elementos encontrados
   */
  searchByChildValue(
    path: string,
    childKey: string,
    searchValue: any,
    options?: Omit<RealtimeQueryOptions, 'orderByChild' | 'equalTo'>
  ): Promise<any>;

  /**
   * Obtiene elementos en un rango de valores
   * @param path - Ruta de la colección
   * @param childKey - Campo por el cual filtrar
   * @param startValue - Valor inicial del rango
   * @param endValue - Valor final del rango
   * @param options - Opciones adicionales de query
   * @returns Promise con elementos en el rango
   */
  getDataInRange(
    path: string,
    childKey: string,
    startValue: any,
    endValue: any,
    options?: Omit<RealtimeQueryOptions, 'orderByChild' | 'startAt' | 'endAt'>
  ): Promise<any>;

  /**
   * Cuenta elementos en una colección
   * @param path - Ruta de la colección
   * @param options - Opciones de filtrado
   * @returns Promise con el número de elementos
   */
  countItems(path: string, options?: RealtimeQueryOptions): Promise<number>;

  // ========================================
  // BATCH OPERATIONS
  // ========================================

  /**
   * Ejecuta múltiples operaciones de forma atómica
   * @param operations - Array de operaciones a ejecutar
   * @returns Promise con resultado del batch
   */
  executeBatchOperations(operations: BatchOperation[]): Promise<BatchResult>;

  /**
   * Actualiza múltiples paths de forma atómica
   * @param updates - Objeto con paths como keys y valores como values
   * @returns Promise con boolean de éxito
   */
  multiPathUpdate(updates: { [path: string]: any }): Promise<boolean>;

  // ========================================
  // TRANSACTION OPERATIONS
  // ========================================

  /**
   * Ejecuta una transacción
   * @param transaction - Configuración de la transacción
   * @returns Promise con resultado de la transacción
   */
  executeTransaction(transaction: RealtimeTransaction): Promise<TransactionResult>;

  /**
   * Incrementa un valor numérico de forma atómica
   * @param path - Ruta del valor a incrementar
   * @param increment - Valor a incrementar (puede ser negativo)
   * @returns Promise con el nuevo valor
   */
  incrementValue(path: string, increment: number): Promise<number>;

  /**
   * Agrega elemento a un array de forma atómica
   * @param path - Ruta del array
   * @param item - Elemento a agregar
   * @returns Promise con boolean de éxito
   */
  appendToArray(path: string, item: any): Promise<boolean>;

  /**
   * Remueve elemento de un array de forma atómica
   * @param path - Ruta del array
   * @param index - Índice del elemento a remover
   * @returns Promise con boolean de éxito
   */
  removeFromArray(path: string, index: number): Promise<boolean>;

  // ========================================
  // CONNECTION AND PRESENCE
  // ========================================

  /**
   * Obtiene el estado de conexión
   * @returns Promise con estado de conexión
   */
  getConnectionState(): Promise<ConnectionState>;

  /**
   * Escucha cambios en el estado de conexión
   * @param callback - Función que se ejecuta cuando cambia el estado
   * @returns Función para cancelar la suscripción
   */
  listenToConnectionState(callback: (state: ConnectionState) => void): Unsubscribe;

  /**
   * Obtiene el timestamp del servidor
   * @returns Promise con timestamp del servidor
   */
  getServerTimestamp(): Promise<number>;

  /**
   * Configura presencia para un usuario
   * @param userId - ID del usuario
   * @param presenceData - Datos de presencia
   * @returns Promise con boolean de éxito
   */
  setUserPresence(userId: string, presenceData: any): Promise<boolean>;

  /**
   * Escucha la presencia de un usuario
   * @param userId - ID del usuario
   * @param callback - Función que se ejecuta cuando cambia la presencia
   * @returns Función para cancelar la suscripción
   */
  listenToUserPresence(userId: string, callback: (presence: PresenceInfo) => void): Unsubscribe;

  /**
   * Obtiene usuarios conectados
   * @param path - Ruta de presencia (ej: "presence/users")
   * @returns Promise con lista de usuarios conectados
   */
  getOnlineUsers(path: string): Promise<string[]>;

  /**
   * Escucha usuarios conectados en tiempo real
   * @param path - Ruta de presencia
   * @param callback - Función que se ejecuta cuando cambian los usuarios conectados
   * @returns Función para cancelar la suscripción
   */
  listenToOnlineUsers(path: string, callback: (users: string[]) => void): Unsubscribe;

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Obtiene referencia de la base de datos
   * @param path - Ruta opcional
   * @returns DatabaseReference
   */
  getDatabaseReference(path?: string): DatabaseReference;

  /**
   * Genera una nueva push key
   * @param path - Ruta donde se generaría la key
   * @returns String con nueva push key
   */
  generatePushKey(path: string): string;

  /**
   * Valida un path de Firebase
   * @param path - Path a validar
   * @returns boolean indicando si es válido
   */
  validatePath(path: string): boolean;

  /**
   * Convierte datos de Firebase a objeto plano
   * @param snapshot - DataSnapshot de Firebase
   * @returns Objeto con datos convertidos
   */
  snapshotToObject(snapshot: DataSnapshot): any;

  /**
   * Convierte datos de Firebase a array
   * @param snapshot - DataSnapshot de Firebase
   * @param includeKeys - Si incluir las keys como propiedad 'key'
   * @returns Array con datos convertidos
   */
  snapshotToArray(snapshot: DataSnapshot, includeKeys?: boolean): any[];

  /**
   * Desconecta todos los listeners activos
   * @param unsubscribeFunctions - Array de funciones unsubscribe
   */
  disconnectAllListeners(unsubscribeFunctions: Unsubscribe[]): void;

  /**
   * Limpia cache local (si aplica)
   * @returns Promise con boolean de éxito
   */
  clearCache(): Promise<boolean>;

  /**
   * Habilita/deshabilita persistencia offline
   * @param enabled - Si habilitar persistencia
   * @returns Promise con boolean de éxito
   */
  setPersistenceEnabled(enabled: boolean): Promise<boolean>;

  // ========================================
  // SECURITY AND VALIDATION
  // ========================================

  /**
   * Valida estructura de datos antes de guardar
   * @param data - Datos a validar
   * @param schema - Schema de validación (opcional)
   * @returns boolean indicando si los datos son válidos
   */
  validateData(data: any, schema?: any): boolean;

  /**
   * Sanitiza datos antes de guardar
   * @param data - Datos a sanitizar
   * @returns Datos sanitizados
   */
  sanitizeData(data: any): any;

  /**
   * Obtiene información de seguridad del path
   * @param path - Path a verificar
   * @returns Promise con información de permisos
   */
  getSecurityInfo(path: string): Promise<{ readable: boolean; writable: boolean }>;
}

// ========================================
// EXPORT INTERFACES
// ========================================

export default ICompleteRealtimeService;

export type {
  RealtimeQueryOptions,
  ListenerOptions,
  BatchOperation,
  BatchResult,
  RealtimeTransaction,
  TransactionResult,
  PaginationState,
  PaginatedResult,
  ConnectionState,
  PresenceInfo,
};