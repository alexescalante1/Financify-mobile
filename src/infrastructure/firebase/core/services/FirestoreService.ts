import { injectable } from "tsyringe";
import {
  Unsubscribe,
  DocumentData,
  Timestamp,
  WhereFilterOp,
  OrderByDirection,
  QueryDocumentSnapshot,
  FieldValue,
  DocumentReference,
  CollectionReference,
  Transaction,
  FirestoreError,
} from "firebase/firestore";

// Re-export types for backward compatibility
export {
  FirestoreQueryOptions,
  PaginationOptions,
  BatchOperation,
  ListenerOptions,
  DateRangeOptions,
} from "./firestore/FirestoreTypes";

import {
  FirestoreQueryOptions,
  PaginationOptions,
  BatchOperation,
  ListenerOptions,
  DateRangeOptions,
} from "./firestore/FirestoreTypes";

import { FirestoreCrudService } from "./firestore/FirestoreCrudService";
import { FirestoreQueryService } from "./firestore/FirestoreQueryService";
import { FirestoreListenerService } from "./firestore/FirestoreListenerService";
import { FirestoreBatchService } from "./firestore/FirestoreBatchService";

@injectable()
class FirebaseFirestoreService {
  constructor(
    private readonly crudService: FirestoreCrudService,
    private readonly queryService: FirestoreQueryService,
    private readonly listenerService: FirestoreListenerService,
    private readonly batchService: FirestoreBatchService,
  ) {}

  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  async getMaxId(collectionName: string): Promise<number> {
    return this.crudService.getMaxId(collectionName);
  }

  async getDocumentById(collectionName: string, docId: string): Promise<DocumentData | null> {
    return this.crudService.getDocumentById(collectionName, docId);
  }

  async getDocuments(collectionName: string, options?: FirestoreQueryOptions): Promise<DocumentData[]> {
    return this.crudService.getDocuments(collectionName, options);
  }

  async addDocument(collectionName: string, data: Record<string, unknown>): Promise<string> {
    return this.crudService.addDocument(collectionName, data);
  }

  async setDocument(collectionName: string, docId: string, data: Record<string, unknown>, merge: boolean = false): Promise<boolean> {
    return this.crudService.setDocument(collectionName, docId, data, merge);
  }

  async updateDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<boolean> {
    return this.crudService.updateDocument(collectionName, docId, data);
  }

  async deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    return this.crudService.deleteDocument(collectionName, docId);
  }

  async documentExists(collectionName: string, docId: string): Promise<boolean> {
    return this.crudService.documentExists(collectionName, docId);
  }

  async getDocumentCount(collectionName: string, options?: FirestoreQueryOptions): Promise<number> {
    return this.crudService.getDocumentCount(collectionName, options);
  }

  // ========================================
  // ARRAY AND FIELD OPERATIONS
  // ========================================

  async updateArrayField(collectionName: string, docId: string, fieldName: string, operation: "add" | "remove", values: unknown[]): Promise<boolean> {
    return this.crudService.updateArrayField(collectionName, docId, fieldName, operation, values);
  }

  async incrementField(collectionName: string, docId: string, fieldName: string, value: number): Promise<boolean> {
    return this.crudService.incrementField(collectionName, docId, fieldName, value);
  }

  // ========================================
  // REAL-TIME LISTENERS
  // ========================================

  listenToDocument(collectionName: string, docId: string, callback: (data: DocumentData | null) => void, onError?: (error: FirestoreError) => void, includeMetadata: boolean = false): Unsubscribe {
    return this.listenerService.listenToDocument(collectionName, docId, callback, onError, includeMetadata);
  }

  listenToCollection(collectionName: string, callback: (data: DocumentData[]) => void, onError?: (error: FirestoreError) => void, options?: ListenerOptions): Unsubscribe {
    return this.listenerService.listenToCollection(collectionName, callback, onError, options);
  }

  listenToCollectionByDateRange(collectionName: string, dateField: string, startDate: Date, endDate: Date, callback: (data: DocumentData[]) => void, onError?: (error: FirestoreError) => void, options?: DateRangeOptions): Unsubscribe {
    return this.listenerService.listenToCollectionByDateRange(collectionName, dateField, startDate, endDate, callback, onError, options);
  }

  listenToCollectionWithFilters(collectionName: string, filters: Array<{ field: string; operator: WhereFilterOp; value: unknown }>, callback: (data: DocumentData[]) => void, onError?: (error: FirestoreError) => void, options?: Omit<ListenerOptions, "where">): Unsubscribe {
    return this.listenerService.listenToCollectionWithFilters(collectionName, filters, callback, onError, options);
  }

  listenToLatestDocuments(collectionName: string, orderByField: string, limitCount: number, callback: (data: DocumentData[]) => void, onError?: (error: FirestoreError) => void, orderDirection: OrderByDirection = "desc"): Unsubscribe {
    return this.listenerService.listenToLatestDocuments(collectionName, orderByField, limitCount, callback, onError, orderDirection);
  }

  listenToPaginatedCollection(collectionName: string, options: PaginationOptions & ListenerOptions, callback: (data: { documents: DocumentData[]; hasNext: boolean; hasPrevious: boolean }) => void, onError?: (error: FirestoreError) => void): Unsubscribe {
    return this.listenerService.listenToPaginatedCollection(collectionName, options, callback, onError);
  }

  listenToSearchResults(collectionName: string, field: string, searchTerm: string, callback: (data: DocumentData[]) => void, onError?: (error: FirestoreError) => void, options?: FirestoreQueryOptions): Unsubscribe {
    return this.listenerService.listenToSearchResults(collectionName, field, searchTerm, callback, onError, options);
  }

  disconnectAllListeners(unsubscribeFunctions: Unsubscribe[]): void {
    return this.listenerService.disconnectAllListeners(unsubscribeFunctions);
  }

  // ========================================
  // QUERY OPERATIONS
  // ========================================

  async getPaginatedDocuments(collectionName: string, options: PaginationOptions & FirestoreQueryOptions): Promise<{ documents: DocumentData[]; lastDoc: QueryDocumentSnapshot | null; firstDoc: QueryDocumentSnapshot | null; hasNext: boolean; hasPrevious: boolean }> {
    return this.queryService.getPaginatedDocuments(collectionName, options);
  }

  async searchDocuments(collectionName: string, field: string, searchTerm: string, options?: FirestoreQueryOptions): Promise<DocumentData[]> {
    return this.queryService.searchDocuments(collectionName, field, searchTerm, options);
  }

  // ========================================
  // BATCH AND TRANSACTION OPERATIONS
  // ========================================

  async executeBatchOperations(operations: BatchOperation[]): Promise<boolean> {
    return this.batchService.executeBatchOperations(operations);
  }

  async multiPathUpdate(updates: Record<string, unknown>): Promise<boolean> {
    return this.batchService.multiPathUpdate(updates);
  }

  async executeTransaction<T>(transactionFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    return this.batchService.executeTransaction(transactionFunction);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getServerTimestamp(): FieldValue {
    return this.crudService.getServerTimestamp();
  }

  timestampToDate(timestamp: Timestamp): Date {
    return this.crudService.timestampToDate(timestamp);
  }

  dateToTimestamp(date: Date): Timestamp {
    return this.crudService.dateToTimestamp(date);
  }

  getDocumentReference(collectionName: string, docId: string): DocumentReference {
    return this.crudService.getDocumentReference(collectionName, docId);
  }

  getCollectionReference(collectionName: string): CollectionReference {
    return this.crudService.getCollectionReference(collectionName);
  }

  generateDocumentId(): string {
    return this.crudService.generateDocumentId();
  }
}

export default FirebaseFirestoreService;
