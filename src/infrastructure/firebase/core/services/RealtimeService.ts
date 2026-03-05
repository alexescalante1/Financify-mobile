import { injectable } from 'tsyringe';
import {
  DatabaseReference,
  DataSnapshot,
  Unsubscribe,
} from "firebase/database";

// Re-export types for backward compatibility
export {
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
} from "./realtime/RealtimeTypes";

import {
  RealtimeQueryOptions,
  ListenerOptions,
  BatchOperation,
  BatchResult,
  RealtimeTransaction,
  TransactionResult,
  PaginatedResult,
  ConnectionState,
  PresenceInfo,
} from "./realtime/RealtimeTypes";

import { RealtimeCrudService } from "./realtime/RealtimeCrudService";
import { RealtimeQueryService } from "./realtime/RealtimeQueryService";
import { RealtimeListenerService } from "./realtime/RealtimeListenerService";
import { RealtimeBatchService } from "./realtime/RealtimeBatchService";
import { RealtimeConnectionService } from "./realtime/RealtimeConnectionService";

@injectable()
class FirebaseRealtimeService {
  constructor(
    private readonly crudService: RealtimeCrudService,
    private readonly queryService: RealtimeQueryService,
    private readonly listenerService: RealtimeListenerService,
    private readonly batchService: RealtimeBatchService,
    private readonly connectionService: RealtimeConnectionService,
  ) {}

  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  async getDataByPath(path: string): Promise<unknown> {
    return this.crudService.getDataByPath(path);
  }

  async getDataWithQuery(path: string, options: RealtimeQueryOptions): Promise<unknown> {
    return this.crudService.getDataWithQuery(path, options);
  }

  async setDataByPath(path: string, data: unknown): Promise<boolean> {
    return this.crudService.setDataByPath(path, data);
  }

  async updateDataByPath(path: string, data: Record<string, unknown>): Promise<boolean> {
    return this.crudService.updateDataByPath(path, data);
  }

  async deleteDataByPath(path: string): Promise<boolean> {
    return this.crudService.deleteDataByPath(path);
  }

  async pushData(path: string, data: unknown): Promise<string | null> {
    return this.crudService.pushData(path, data);
  }

  async pathExists(path: string): Promise<boolean> {
    return this.crudService.pathExists(path);
  }

  // ========================================
  // REAL-TIME LISTENERS
  // ========================================

  listenToPath(path: string, callback: (data: unknown, snapshot: DataSnapshot) => void, onError?: (error: Error) => void, options?: ListenerOptions): Unsubscribe {
    return this.listenerService.listenToPath(path, callback, onError, options);
  }

  listenToValue(path: string, callback: (value: unknown) => void, onError?: (error: Error) => void): Unsubscribe {
    return this.listenerService.listenToValue(path, callback, onError);
  }

  listenToChildAdded(path: string, callback: (data: unknown, key: string, prevChildKey?: string | null) => void, onError?: (error: Error) => void, options?: RealtimeQueryOptions): Unsubscribe {
    return this.listenerService.listenToChildAdded(path, callback, onError, options);
  }

  listenToChildChanged(path: string, callback: (data: unknown, key: string, prevChildKey?: string | null) => void, onError?: (error: Error) => void, options?: RealtimeQueryOptions): Unsubscribe {
    return this.listenerService.listenToChildChanged(path, callback, onError, options);
  }

  listenToChildRemoved(path: string, callback: (data: unknown, key: string) => void, onError?: (error: Error) => void, options?: RealtimeQueryOptions): Unsubscribe {
    return this.listenerService.listenToChildRemoved(path, callback, onError, options);
  }

  listenToChildMoved(path: string, callback: (data: unknown, key: string, prevChildKey?: string | null) => void, onError?: (error: Error) => void, options?: RealtimeQueryOptions): Unsubscribe {
    return this.listenerService.listenToChildMoved(path, callback, onError, options);
  }

  disconnectAllListeners(unsubscribeFunctions: Unsubscribe[]): void {
    return this.listenerService.disconnectAllListeners(unsubscribeFunctions);
  }

  // ========================================
  // ADVANCED QUERY OPERATIONS
  // ========================================

  async getPaginatedData(path: string, pageSize: number, startAfterKey?: string, options?: RealtimeQueryOptions): Promise<PaginatedResult> {
    return this.queryService.getPaginatedData(path, pageSize, startAfterKey, options);
  }

  listenToPaginatedData(path: string, pageSize: number, callback: (result: PaginatedResult) => void, onError?: (error: Error) => void, startAfterKey?: string, options?: RealtimeQueryOptions): Unsubscribe {
    return this.queryService.listenToPaginatedData(path, pageSize, callback, onError, startAfterKey, options);
  }

  async searchByChildValue(path: string, childKey: string, searchValue: number | string | boolean | null, options?: Omit<RealtimeQueryOptions, "orderByChild" | "equalTo">): Promise<unknown> {
    return this.queryService.searchByChildValue(path, childKey, searchValue, this.crudService.getDataWithQuery.bind(this.crudService), options);
  }

  async getDataInRange(path: string, childKey: string, startValue: number | string | boolean | null, endValue: number | string | boolean | null, options?: Omit<RealtimeQueryOptions, "orderByChild" | "startAt" | "endAt">): Promise<unknown> {
    return this.queryService.getDataInRange(path, childKey, startValue, endValue, this.crudService.getDataWithQuery.bind(this.crudService), options);
  }

  async countItems(path: string, options?: RealtimeQueryOptions): Promise<number> {
    return this.queryService.countItems(path, this.crudService.getDataByPath.bind(this.crudService), this.crudService.getDataWithQuery.bind(this.crudService), options);
  }

  // ========================================
  // BATCH OPERATIONS
  // ========================================

  async executeBatchOperations(operations: BatchOperation[]): Promise<BatchResult> {
    return this.batchService.executeBatchOperations(operations);
  }

  async multiPathUpdate(updates: Record<string, unknown>): Promise<boolean> {
    return this.batchService.multiPathUpdate(updates);
  }

  // ========================================
  // TRANSACTION OPERATIONS
  // ========================================

  async executeTransaction(transaction: RealtimeTransaction): Promise<TransactionResult> {
    return this.batchService.executeTransaction(transaction);
  }

  async incrementValue(path: string, increment: number): Promise<number> {
    return this.batchService.incrementValue(path, increment);
  }

  async appendToArray(path: string, item: unknown): Promise<boolean> {
    return this.batchService.appendToArray(path, item);
  }

  async removeFromArray(path: string, index: number): Promise<boolean> {
    return this.batchService.removeFromArray(path, index);
  }

  // ========================================
  // CONNECTION AND PRESENCE
  // ========================================

  async getConnectionState(): Promise<ConnectionState> {
    return this.connectionService.getConnectionState();
  }

  listenToConnectionState(callback: (state: ConnectionState) => void): Unsubscribe {
    return this.connectionService.listenToConnectionState(callback);
  }

  async getServerTimestamp(): Promise<number> {
    return this.connectionService.getServerTimestamp();
  }

  async setUserPresence(userId: string, presenceData: Record<string, unknown>): Promise<boolean> {
    return this.connectionService.setUserPresence(userId, presenceData);
  }

  listenToUserPresence(userId: string, callback: (presence: PresenceInfo) => void): Unsubscribe {
    return this.connectionService.listenToUserPresence(userId, callback);
  }

  async getOnlineUsers(path: string): Promise<string[]> {
    return this.connectionService.getOnlineUsers(path, this.crudService.getDataByPath.bind(this.crudService));
  }

  listenToOnlineUsers(path: string, callback: (users: string[]) => void): Unsubscribe {
    return this.connectionService.listenToOnlineUsers(path, callback, this.listenerService.listenToPath.bind(this.listenerService));
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getDatabaseReference(path?: string): DatabaseReference {
    return this.crudService.getDatabaseReference(path);
  }

  generatePushKey(path: string): string {
    return this.crudService.generatePushKey(path);
  }

  validatePath(path: string): boolean {
    return this.crudService.validatePath(path);
  }

  snapshotToObject(snapshot: DataSnapshot): unknown {
    return this.crudService.snapshotToObject(snapshot);
  }

  snapshotToArray(snapshot: DataSnapshot, includeKeys: boolean = false): unknown[] {
    return this.crudService.snapshotToArray(snapshot, includeKeys);
  }

  validateData(data: unknown, schema?: unknown): boolean {
    return this.crudService.validateData(data, schema);
  }

  sanitizeData(data: unknown): unknown {
    return this.crudService.sanitizeData(data);
  }

  async getSecurityInfo(path: string): Promise<{ readable: boolean; writable: boolean }> {
    return this.crudService.getSecurityInfo(path);
  }

  async clearCache(): Promise<boolean> {
    return this.connectionService.clearCache();
  }

  async setPersistenceEnabled(enabled: boolean): Promise<boolean> {
    return this.connectionService.setPersistenceEnabled(enabled);
  }
}

export default FirebaseRealtimeService;
