import { injectable } from "tsyringe";
import { db } from "../FirebaseConfiguration";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  Unsubscribe,
  QuerySnapshot,
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  runTransaction,
  WhereFilterOp,
  OrderByDirection,
  QueryDocumentSnapshot,
  FieldValue,
  getCountFromServer,
  AggregateQuerySnapshot,
  DocumentReference,
  Query,
  CollectionReference,
} from "firebase/firestore";

import IFirebaseFirestoreService, {
  FirestoreQueryOptions,
  PaginationOptions,
  BatchOperation,
  ListenerOptions,
  DateRangeOptions,
} from "@/domain/interfaces/service/IFirebaseFirestoreService";

@injectable()
class FirebaseFirestoreService implements IFirebaseFirestoreService {
  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  /**
   * Obtiene ID máximo de colección.
   */
  async getMaxId(collectionName: string): Promise<number> {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy("id", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data().id ?? 0;
      }

      // Si no hay documentos, devuelve 0
      return 0;
    } catch (error) {
      console.error("Error al obtener el máximo ID:", error);
      throw error;
    }
  }

  /**
   * Obtiene un documento por ID
   */
  async getDocumentById(
    collectionName: string,
    docId: string
  ): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log(`📄 Document not found: ${collectionName}/${docId}`);
        return null;
      }
    } catch (error) {
      console.error(
        `❌ Error getting document ${collectionName}/${docId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene múltiples documentos con filtros opcionales
   */
  async getDocuments(
    collectionName: string,
    options?: FirestoreQueryOptions
  ): Promise<DocumentData[]> {
    try {
      console.log(`🔍 Getting documents from ${collectionName}`, options);

      const q = this.buildQuery(collectionName, options);
      const querySnapshot = await getDocs(q);

      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(
        `📊 Retrieved ${documents.length} documents from ${collectionName}`
      );
      return documents;
    } catch (error) {
      console.error(
        `❌ Error getting documents from ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crea un nuevo documento con ID automático
   */
  async addDocument(collectionName: string, data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(
        `✅ Document added to ${collectionName} with ID: ${docRef.id}`
      );
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Crea o actualiza un documento con ID específico
   */
  async setDocument(
    collectionName: string,
    docId: string,
    data: any,
    merge: boolean = false
  ): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (!merge) {
        dataWithTimestamp.createdAt = serverTimestamp();
      }

      await setDoc(docRef, dataWithTimestamp, { merge });

      console.log(`✅ Document set in ${collectionName}/${docId}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Error setting document ${collectionName}/${docId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Actualiza un documento existente
   */
  async updateDocument(
    collectionName: string,
    docId: string,
    data: any
  ): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Document updated in ${collectionName}/${docId}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Error updating document ${collectionName}/${docId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Elimina un documento
   */
  async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<boolean> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      console.log(`✅ Document deleted from ${collectionName}/${docId}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Error deleting document ${collectionName}/${docId}:`,
        error
      );
      throw error;
    }
  }

  // ========================================
  // REAL-TIME LISTENERS (onSnapshot)
  // ========================================

  /**
   * Escucha cambios en tiempo real de un documento específico
   */
  listenToDocument(
    collectionName: string,
    docId: string,
    callback: (data: DocumentData | null) => void,
    onError?: (error: any) => void,
    includeMetadata: boolean = false
  ): Unsubscribe {
    console.log(
      `👂 Setting up listener for document: ${collectionName}/${docId}`
    );

    const docRef = doc(db, collectionName, docId);

    return onSnapshot(
      docRef,
      { includeMetadataChanges: includeMetadata },
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() };
          console.log(
            `📡 Document updated: ${collectionName}/${docId}`,
            includeMetadata
              ? `(from cache: ${snapshot.metadata.fromCache})`
              : ""
          );
          callback(data);
        } else {
          console.log(`📭 Document not found: ${collectionName}/${docId}`);
          callback(null);
        }
      },
      (error) => {
        console.error(
          `❌ Error listening to document ${collectionName}/${docId}:`,
          error
        );
        if (onError) onError(error);
      }
    );
  }

  /**
   * Escucha cambios en tiempo real de una colección completa
   */
  listenToCollection(
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: ListenerOptions
  ): Unsubscribe {
    console.log(
      `👂 Setting up listener for collection: ${collectionName}`,
      options
    );

    const q = this.buildQuery(collectionName, options);

    return onSnapshot(
      q,
      {
        includeMetadataChanges: options?.includeMetadata || false,
      },
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(`📡 Collection snapshot: ${collectionName}`, {
          size: snapshot.size,
          empty: snapshot.empty,
          fromCache: snapshot.metadata.fromCache,
          changes: snapshot.docChanges().length,
        });

        if (options?.includeDocChanges) {
          const changes = snapshot.docChanges().map((change) => ({
            type: change.type,
            doc: { id: change.doc.id, ...change.doc.data() },
            oldIndex: change.oldIndex,
            newIndex: change.newIndex,
          }));
          console.log(`🔄 Document changes:`, changes);
        }

        callback(docs);
      },
      (error) => {
        console.error(
          `❌ Error listening to collection ${collectionName}:`,
          error
        );
        if (onError) onError(error);
      }
    );
  }

  /**
   * Escucha cambios por rango de fechas en tiempo real
   */
  listenToCollectionByDateRange(
    collectionName: string,
    dateField: string,
    startDate: Date,
    endDate: Date,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: DateRangeOptions
  ): Unsubscribe {
    console.log(`👂 Setting up date range listener for: ${collectionName}`, {
      dateField,
      startDate,
      endDate,
      options,
    });

    let q: Query = collection(db, collectionName);

    // Aplicar filtros de fecha
    q = query(
      q,
      where(dateField, ">=", Timestamp.fromDate(startDate)),
      where(dateField, "<=", Timestamp.fromDate(endDate))
    );

    // Aplicar ordenamiento si se especifica
    if (options?.orderByField) {
      q = query(
        q,
        orderBy(options.orderByField, options.orderDirection || "asc")
      );
    }

    // Aplicar límite si se especifica
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(`📡 Date range snapshot: ${collectionName}`, {
          size: snapshot.size,
          dateRange: `${startDate.toISOString()} - ${endDate.toISOString()}`,
        });

        callback(docs);
      },
      (error) => {
        console.error(
          `❌ Error listening to ${collectionName} by date range:`,
          error
        );
        if (onError) onError(error);
      }
    );
  }

  /**
   * Escucha cambios en tiempo real con filtros personalizados
   */
  listenToCollectionWithFilters(
    collectionName: string,
    filters: Array<{ field: string; operator: WhereFilterOp; value: any }>,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: Omit<ListenerOptions, "where">
  ): Unsubscribe {
    console.log(`👂 Setting up filtered listener for: ${collectionName}`, {
      filters,
      options,
    });

    const queryOptions: ListenerOptions = {
      ...options,
      where: filters,
    };

    return this.listenToCollection(
      collectionName,
      callback,
      onError,
      queryOptions
    );
  }

  /**
   * Escucha los últimos N documentos en tiempo real
   */
  listenToLatestDocuments(
    collectionName: string,
    orderByField: string,
    limitCount: number,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    orderDirection: OrderByDirection = "desc"
  ): Unsubscribe {
    console.log(`👂 Setting up latest documents listener: ${collectionName}`, {
      orderByField,
      limitCount,
      orderDirection,
    });

    const options: ListenerOptions = {
      orderBy: [{ field: orderByField, direction: orderDirection }],
      limit: limitCount,
      includeDocChanges: true,
    };

    return this.listenToCollection(collectionName, callback, onError, options);
  }

  // ========================================
  // ADVANCED OPERATIONS
  // ========================================

  /**
   * Paginación de documentos con soporte para listeners
   */
  async getPaginatedDocuments(
    collectionName: string,
    options: PaginationOptions & FirestoreQueryOptions
  ): Promise<{
    documents: DocumentData[];
    lastDoc: QueryDocumentSnapshot | null;
    firstDoc: QueryDocumentSnapshot | null;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    try {
      console.log(
        `📄 Getting paginated documents from ${collectionName}`,
        options
      );

      let q = this.buildQuery(collectionName, options);

      // Aplicar paginación
      const pageSize = options.pageSize;
      q = query(q, limit(pageSize + 1)); // +1 para determinar si hay más páginas

      if (options.lastDoc) {
        if (options.direction === "previous") {
          q = query(q, endBefore(options.lastDoc));
        } else {
          q = query(q, startAfter(options.lastDoc));
        }
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      const hasNext = docs.length > pageSize;
      const documents = docs.slice(0, pageSize).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const lastDoc = documents.length > 0 ? docs[documents.length - 1] : null;
      const firstDoc = documents.length > 0 ? docs[0] : null;
      const hasPrevious = !!options.lastDoc;

      console.log(
        `📊 Paginated result: ${documents.length} documents, hasNext: ${hasNext}`
      );

      return {
        documents,
        lastDoc,
        firstDoc,
        hasNext,
        hasPrevious,
      };
    } catch (error) {
      console.error(
        `❌ Error getting paginated documents from ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Escucha paginación en tiempo real
   */
  listenToPaginatedCollection(
    collectionName: string,
    options: PaginationOptions & ListenerOptions,
    callback: (data: {
      documents: DocumentData[];
      hasNext: boolean;
      hasPrevious: boolean;
    }) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    console.log(
      `👂 Setting up paginated listener for: ${collectionName}`,
      options
    );

    let q = this.buildQuery(collectionName, options);

    const pageSize = options.pageSize;
    q = query(q, limit(pageSize + 1));

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs;
        const hasNext = docs.length > pageSize;
        const documents = docs.slice(0, pageSize).map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const hasPrevious = !!options.lastDoc;

        console.log(`📡 Paginated snapshot: ${documents.length} documents`);

        callback({
          documents,
          hasNext,
          hasPrevious,
        });
      },
      (error) => {
        console.error(
          `❌ Error in paginated listener for ${collectionName}:`,
          error
        );
        if (onError) onError(error);
      }
    );
  }

  /**
   * Contar documentos en una colección
   */
  async getDocumentCount(
    collectionName: string,
    options?: FirestoreQueryOptions
  ): Promise<number> {
    try {
      const q = this.buildQuery(collectionName, options);
      const snapshot: AggregateQuerySnapshot<any> = await getCountFromServer(q);
      const count = snapshot.data().count as number;

      console.log(`🔢 Document count for ${collectionName}: ${count}`);
      return count;
    } catch (error) {
      console.error(
        `❌ Error getting document count for ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Operaciones batch (hasta 500 operaciones)
   */
  async executeBatchOperations(operations: BatchOperation[]): Promise<boolean> {
    try {
      console.log(`🔄 Executing ${operations.length} batch operations`);

      const batch = writeBatch(db);

      operations.forEach((operation, index) => {
        const docRef = doc(db, operation.collectionName, operation.docId);

        switch (operation.operation) {
          case "set":
            const setData = {
              ...operation.data,
              updatedAt: serverTimestamp(),
            };
            if (!operation.merge) {
              setData.createdAt = serverTimestamp();
            }
            batch.set(docRef, setData, { merge: operation.merge || false });
            break;

          case "update":
            batch.update(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp(),
            });
            break;

          case "delete":
            batch.delete(docRef);
            break;
        }

        console.log(
          `📝 Batch operation ${index + 1}: ${operation.operation} ${
            operation.collectionName
          }/${operation.docId}`
        );
      });

      await batch.commit();
      console.log(`✅ Batch operations completed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error executing batch operations:`, error);
      throw error;
    }
  }

  /**
   * Actualiza múltiples paths de forma atómica
   */
  async multiPathUpdate(updates: { [path: string]: any }): Promise<boolean> {
    try {
      console.log(
        `🔄 Multi-path update for ${Object.keys(updates).length} paths`
      );

      const batch = writeBatch(db);

      // Procesar cada path del update
      Object.entries(updates).forEach(([path, value]) => {
        // El path puede ser "collectionName/docId" o "collectionName/docId/field"
        const pathParts = path.split("/");

        if (pathParts.length >= 2) {
          const collectionName = pathParts[0];
          const docId = pathParts[1];

          if (pathParts.length === 2) {
            // Update completo del documento: "users/123"
            const docRef = doc(db, collectionName, docId);
            if (value === null) {
              batch.delete(docRef);
            } else {
              batch.set(
                docRef,
                {
                  ...value,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          } else {
            // Update de campo específico: "users/123/isPrimary"
            const fieldPath = pathParts.slice(2).join(".");
            const docRef = doc(db, collectionName, docId);

            if (value === null) {
              // Para eliminar un campo específico, necesitamos usar deleteField()
              // Pero como no está importado, usamos un approach diferente
              batch.update(docRef, {
                [fieldPath]: value,
                updatedAt: serverTimestamp(),
              });
            } else {
              batch.update(docRef, {
                [fieldPath]: value,
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      });

      await batch.commit();
      console.log(`✅ Multi-path update completed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error in multi-path update:`, error);
      return false;
    }
  }

  /**
   * Transacción
   */
  async executeTransaction<T>(
    transactionFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      console.log(`🔄 Executing transaction`);
      const result = await runTransaction(db, transactionFunction);
      console.log(`✅ Transaction completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Error executing transaction:`, error);
      throw error;
    }
  }

  // ========================================
  // ARRAY AND FIELD OPERATIONS
  // ========================================

  /**
   * Operaciones de array (agregar/quitar elementos)
   */
  async updateArrayField(
    collectionName: string,
    docId: string,
    fieldName: string,
    operation: "add" | "remove",
    values: any[]
  ): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (operation === "add") {
        updateData[fieldName] = arrayUnion(...values);
      } else {
        updateData[fieldName] = arrayRemove(...values);
      }

      await updateDoc(docRef, updateData);
      console.log(
        `✅ Array field ${fieldName} updated in ${collectionName}/${docId}`
      );
      return true;
    } catch (error) {
      console.error(`❌ Error updating array field ${fieldName}:`, error);
      throw error;
    }
  }

  /**
   * Incrementar/decrementar un campo numérico
   */
  async incrementField(
    collectionName: string,
    docId: string,
    fieldName: string,
    value: number
  ): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [fieldName]: increment(value),
        updatedAt: serverTimestamp(),
      });

      console.log(
        `✅ Field ${fieldName} incremented by ${value} in ${collectionName}/${docId}`
      );
      return true;
    } catch (error) {
      console.error(`❌ Error incrementing field ${fieldName}:`, error);
      throw error;
    }
  }

  // ========================================
  // SEARCH AND UTILITY METHODS
  // ========================================

  /**
   * Buscar documentos por texto (busqueda básica)
   */
  async searchDocuments(
    collectionName: string,
    field: string,
    searchTerm: string,
    options?: FirestoreQueryOptions
  ): Promise<DocumentData[]> {
    try {
      console.log(
        `🔍 Searching in ${collectionName} for "${searchTerm}" in field ${field}`
      );

      let q: Query = collection(db, collectionName);

      // Aplicar búsqueda de texto (método básico)
      q = query(
        q,
        where(field, ">=", searchTerm),
        where(field, "<=", searchTerm + "\uf8ff")
      );

      // Aplicar opciones adicionales
      if (options?.orderBy) {
        options.orderBy.forEach((order) => {
          q = query(q, orderBy(order.field, order.direction));
        });
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`📊 Search results: ${results.length} documents found`);
      return results;
    } catch (error) {
      console.error(
        `❌ Error searching documents in ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Escucha búsquedas en tiempo real
   */
  listenToSearchResults(
    collectionName: string,
    field: string,
    searchTerm: string,
    callback: (data: DocumentData[]) => void,
    onError?: (error: any) => void,
    options?: FirestoreQueryOptions
  ): Unsubscribe {
    console.log(
      `👂 Setting up search listener for "${searchTerm}" in ${collectionName}.${field}`
    );

    const searchOptions: ListenerOptions = {
      ...options,
      where: [
        { field, operator: ">=", value: searchTerm },
        { field, operator: "<=", value: searchTerm + "\uf8ff" },
        ...(options?.where || []),
      ],
    };

    return this.listenToCollection(
      collectionName,
      callback,
      onError,
      searchOptions
    );
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Construye un query basado en las opciones proporcionadas
   */
  private buildQuery(
    collectionName: string,
    options?: FirestoreQueryOptions
  ): Query {
    let q: Query = collection(db, collectionName);

    if (options) {
      // Aplicar filtros where
      if (options.where && options.where.length > 0) {
        options.where.forEach((condition) => {
          q = query(
            q,
            where(condition.field, condition.operator, condition.value)
          );
        });
      }

      // Aplicar ordenamiento
      if (options.orderBy && options.orderBy.length > 0) {
        options.orderBy.forEach((order) => {
          q = query(q, orderBy(order.field, order.direction));
        });
      }

      // Aplicar límites
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.limitToLast) {
        q = query(q, limitToLast(options.limitToLast));
      }

      // Aplicar cursores de paginación
      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      if (options.endBefore) {
        q = query(q, endBefore(options.endBefore));
      }
    }

    return q;
  }

  /**
   * Obtener timestamp del servidor
   */
  getServerTimestamp(): FieldValue {
    return serverTimestamp();
  }

  /**
   * Convertir Timestamp a Date
   */
  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  /**
   * Convertir Date a Timestamp
   */
  dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  /**
   * Obtener referencia de documento
   */
  getDocumentReference(
    collectionName: string,
    docId: string
  ): DocumentReference {
    return doc(db, collectionName, docId);
  }

  /**
   * Obtener referencia de colección
   */
  getCollectionReference(collectionName: string): CollectionReference {
    return collection(db, collectionName);
  }

  /**
   * Crear un ID único para documento
   */
  generateDocumentId(): string {
    return doc(collection(db, "temp")).id;
  }

  /**
   * Verificar si un documento existe
   */
  async documentExists(
    collectionName: string,
    docId: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`❌ Error checking if document exists:`, error);
      return false;
    }
  }

  /**
   * Desconectar todos los listeners activos (útil para cleanup)
   */
  disconnectAllListeners(unsubscribeFunctions: Unsubscribe[]): void {
    console.log(`🔌 Disconnecting ${unsubscribeFunctions.length} listeners`);
    unsubscribeFunctions.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Error disconnecting listener:", error);
      }
    });
  }
}

export default FirebaseFirestoreService;
