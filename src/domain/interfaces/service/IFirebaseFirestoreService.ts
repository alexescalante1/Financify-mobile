import {
  Unsubscribe,
  DocumentData,
  WhereFilterOp,
  OrderByDirection,
  QueryDocumentSnapshot,
  FieldValue,
  DocumentReference,
  CollectionReference,
  Timestamp,
} from "firebase/firestore";

// ========================================
// INTERFACES FOR OPTIONS AND CONFIGURATIONS
// ========================================

interface FirestoreQueryOptions {
  where?: Array<{ field: string; operator: WhereFilterOp; value: any }>;
  orderBy?: Array<{ field: string; direction: OrderByDirection }>;
  limit?: number;
  startAfter?: QueryDocumentSnapshot;
  endBefore?: QueryDocumentSnapshot;
  limitToLast?: number;
}

interface PaginationOptions {
  pageSize: number;
  lastDoc?: QueryDocumentSnapshot;
  direction?: 'next' | 'previous';
}

interface BatchOperation {
  operation: 'set' | 'update' | 'delete';
  collectionName: string;
  docId: string;
  data?: any;
  merge?: boolean;
}

interface ListenerOptions extends FirestoreQueryOptions {
  includeMetadata?: boolean;
  includeDocChanges?: boolean;
}

interface DateRangeOptions {
  orderByField?: string;
  orderDirection?: OrderByDirection;
  limit?: number;
}

interface PaginatedResult {
  documents: DocumentData[];
  lastDoc: QueryDocumentSnapshot | null;
  firstDoc: QueryDocumentSnapshot | null;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaginatedListenerResult {
  documents: DocumentData[];
  hasNext: boolean;
  hasPrevious: boolean;
}

// ========================================
// MAIN INTERFACE
// ========================================

interface IFirebaseFirestoreService {
  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  /**
   * Obtiene ID máximo de colección.
   * @param collectionName - Nombre de la colección
   * @returns Promise con Id númerico
   */
  getMaxId(collectionName: string): Promise<number>;

  /**
   * Obtiene un documento por ID
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @returns Promise con los datos del documento o null si no existe
   */
  getDocumentById(collectionName: string, docId: string): Promise<DocumentData | null>;

  /**
   * Obtiene múltiples documentos con filtros opcionales
   * @param collectionName - Nombre de la colección
   * @param options - Opciones de query (filtros, ordenamiento, límites)
   * @returns Promise con array de documentos
   */
  getDocuments(
    collectionName: string,
    options?: FirestoreQueryOptions
  ): Promise<DocumentData[]>;

  /**
   * Crea un nuevo documento con ID automático
   * @param collectionName - Nombre de la colección
   * @param data - Datos del documento
   * @returns Promise con el ID del documento creado
   */
  addDocument(collectionName: string, data: any): Promise<string>;

  /**
   * Crea o actualiza un documento con ID específico
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @param data - Datos del documento
   * @param merge - Si debe hacer merge o sobrescribir
   * @returns Promise con boolean de éxito
   */
  setDocument(
    collectionName: string,
    docId: string,
    data: any,
    merge?: boolean
  ): Promise<boolean>;
  
  /**
   * Actualiza un documento existente
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @param data - Datos a actualizar
   * @returns Promise con boolean de éxito
   */
  updateDocument(
    collectionName: string,
    docId: string,
    data: any
  ): Promise<boolean>;

  /**
   * Elimina un documento
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @returns Promise con boolean de éxito
   */
  deleteDocument(collectionName: string, docId: string): Promise<boolean>;

  // ========================================
  // REAL-TIME LISTENERS (onSnapshot)
  // ========================================

  /**
   * Escucha cambios en tiempo real de un documento específico
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param includeMetadata - Si incluir metadata en los snapshots
   * @returns Función para cancelar la suscripción
   */
  listenToDocument(
    collectionName: string,
    docId: string,
    callback: (data: DocumentData | null) => void,
    onError?: (error: any) => void,
    includeMetadata?: boolean
  ): Unsubscribe;

  /**
   * Escucha cambios en tiempo real de una colección completa
   * @param collectionName - Nombre de la colección
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones del listener (filtros, ordenamiento, metadata)
   * @returns Función para cancelar la suscripción
   */
  listenToCollection(
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: ListenerOptions
  ): Unsubscribe;

  /**
   * Escucha cambios por rango de fechas en tiempo real
   * @param collectionName - Nombre de la colección
   * @param dateField - Campo de fecha para filtrar
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones adicionales (ordenamiento, límite)
   * @returns Función para cancelar la suscripción
   */
  listenToCollectionByDateRange(
    collectionName: string,
    dateField: string,
    startDate: Date,
    endDate: Date,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: DateRangeOptions
  ): Unsubscribe;

  /**
   * Escucha cambios en tiempo real con filtros personalizados
   * @param collectionName - Nombre de la colección
   * @param filters - Array de filtros where
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones adicionales del listener
   * @returns Función para cancelar la suscripción
   */
  listenToCollectionWithFilters(
    collectionName: string,
    filters: Array<{ field: string; operator: WhereFilterOp; value: any }>,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: Omit<ListenerOptions, 'where'>
  ): Unsubscribe;

  /**
   * Escucha los últimos N documentos en tiempo real
   * @param collectionName - Nombre de la colección
   * @param orderByField - Campo por el cual ordenar
   * @param limitCount - Número de documentos a obtener
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param orderDirection - Dirección del ordenamiento
   * @returns Función para cancelar la suscripción
   */
  listenToLatestDocuments(
    collectionName: string,
    orderByField: string,
    limitCount: number,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    orderDirection?: OrderByDirection
  ): Unsubscribe;

  // ========================================
  // ADVANCED OPERATIONS
  // ========================================

  /**
   * Paginación de documentos
   * @param collectionName - Nombre de la colección
   * @param options - Opciones de paginación y query
   * @returns Promise con resultado paginado
   */
  getPaginatedDocuments(
    collectionName: string,
    options: PaginationOptions & FirestoreQueryOptions
  ): Promise<PaginatedResult>;

  /**
   * Escucha paginación en tiempo real
   * @param collectionName - Nombre de la colección
   * @param options - Opciones de paginación y listener
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @returns Función para cancelar la suscripción
   */
  listenToPaginatedCollection(
    collectionName: string,
    options: PaginationOptions & ListenerOptions,
    callback: (data: PaginatedListenerResult) => void,
    onError?: (error: any) => void
  ): Unsubscribe;

  /**
   * Contar documentos en una colección
   * @param collectionName - Nombre de la colección
   * @param options - Opciones de filtrado para el conteo
   * @returns Promise con el número de documentos
   */
  getDocumentCount(
    collectionName: string,
    options?: FirestoreQueryOptions
  ): Promise<number>;

  /**
   * Ejecuta operaciones batch (hasta 500 operaciones)
   * @param operations - Array de operaciones batch
   * @returns Promise con boolean de éxito
   */
  executeBatchOperations(operations: BatchOperation[]): Promise<boolean>;

  /**
   * Actualiza múltiples paths de forma atómica
   * @param updates - Objeto con paths como keys y valores como values
   * @returns Promise con boolean de éxito
   */
  multiPathUpdate(updates: { [path: string]: any }): Promise<boolean>;

  /**
   * Ejecuta una transacción
   * @param transactionFunction - Función de transacción
   * @returns Promise con el resultado de la transacción
   */
  executeTransaction<T>(
    transactionFunction: (transaction: any) => Promise<T>
  ): Promise<T>;

  // ========================================
  // ARRAY AND FIELD OPERATIONS
  // ========================================

  /**
   * Operaciones de array (agregar/quitar elementos)
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @param fieldName - Nombre del campo array
   * @param operation - Tipo de operación ('add' o 'remove')
   * @param values - Valores a agregar o remover
   * @returns Promise con boolean de éxito
   */
  updateArrayField(
    collectionName: string,
    docId: string,
    fieldName: string,
    operation: 'add' | 'remove',
    values: any[]
  ): Promise<boolean>;

  /**
   * Incrementar/decrementar un campo numérico
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @param fieldName - Nombre del campo numérico
   * @param value - Valor a incrementar (puede ser negativo para decrementar)
   * @returns Promise con boolean de éxito
   */
  incrementField(
    collectionName: string,
    docId: string,
    fieldName: string,
    value: number
  ): Promise<boolean>;

  // ========================================
  // SEARCH AND UTILITY METHODS
  // ========================================

  /**
   * Buscar documentos por texto (búsqueda básica)
   * @param collectionName - Nombre de la colección
   * @param field - Campo donde buscar
   * @param searchTerm - Término de búsqueda
   * @param options - Opciones adicionales de query
   * @returns Promise con array de documentos encontrados
   */
  searchDocuments(
    collectionName: string,
    field: string,
    searchTerm: string,
    options?: FirestoreQueryOptions
  ): Promise<DocumentData[]>;

  /**
   * Escucha búsquedas en tiempo real
   * @param collectionName - Nombre de la colección
   * @param field - Campo donde buscar
   * @param searchTerm - Término de búsqueda
   * @param callback - Función que se ejecuta cuando hay cambios
   * @param onError - Función opcional para manejar errores
   * @param options - Opciones adicionales de query
   * @returns Función para cancelar la suscripción
   */
  listenToSearchResults(
    collectionName: string,
    field: string,
    searchTerm: string,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: FirestoreQueryOptions
  ): Unsubscribe;

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Obtener timestamp del servidor
   * @returns FieldValue del timestamp del servidor
   */
  getServerTimestamp(): FieldValue;

  /**
   * Convertir Timestamp a Date
   * @param timestamp - Timestamp de Firestore
   * @returns Date de JavaScript
   */
  timestampToDate(timestamp: Timestamp): Date;

  /**
   * Convertir Date a Timestamp
   * @param date - Date de JavaScript
   * @returns Timestamp de Firestore
   */
  dateToTimestamp(date: Date): Timestamp;

  /**
   * Obtener referencia de documento
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @returns DocumentReference
   */
  getDocumentReference(collectionName: string, docId: string): DocumentReference;

  /**
   * Obtener referencia de colección
   * @param collectionName - Nombre de la colección
   * @returns CollectionReference
   */
  getCollectionReference(collectionName: string): CollectionReference;

  /**
   * Crear un ID único para documento
   * @returns String con ID único
   */
  generateDocumentId(): string;

  /**
   * Verificar si un documento existe
   * @param collectionName - Nombre de la colección
   * @param docId - ID del documento
   * @returns Promise con boolean indicando si existe
   */
  documentExists(collectionName: string, docId: string): Promise<boolean>;

  /**
   * Desconectar todos los listeners activos
   * @param unsubscribeFunctions - Array de funciones unsubscribe
   */
  disconnectAllListeners(unsubscribeFunctions: Unsubscribe[]): void;
}

// ========================================
// EXPORT INTERFACES
// ========================================

export default IFirebaseFirestoreService;

export type {
  FirestoreQueryOptions,
  PaginationOptions,
  BatchOperation,
  ListenerOptions,
  DateRangeOptions,
  PaginatedResult,
  PaginatedListenerResult,
};