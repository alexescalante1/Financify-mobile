import { injectable } from 'tsyringe';
import { rtdb } from "../FirebaseConfiguration";
import {
  ref,
  get,
  set,
  update,
  remove,
  child,
  push,
  onValue,
  off,
  serverTimestamp,
  query,
  orderByChild,
  orderByKey,
  orderByValue,
  limitToFirst,
  limitToLast,
  equalTo,
  startAt,
  endAt,
  startAfter,
  endBefore,
  onDisconnect,
  goOffline,
  goOnline,
  runTransaction,
  DatabaseReference,
  Query,
  DataSnapshot,
  Unsubscribe,
  TransactionResult as FirebaseTransactionResult,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onChildMoved,
} from "firebase/database";

import IFirebaseRealtimeService, {
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
} from "@/domain/interfaces/service/IFirebaseRealtimeService";

@injectable()
class FirebaseRealtimeService implements IFirebaseRealtimeService {
  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  /**
   * Obtiene datos por path
   */
  async getDataByPath(path: string): Promise<any> {
    try {
      console.log(`📖 Getting data from: ${path}`);

      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, path));

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`✅ Data retrieved from ${path}`);
        return data;
      } else {
        console.log(`📭 No data available at ${path}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting data from ${path}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene datos con opciones de query
   */
  async getDataWithQuery(
    path: string,
    options: RealtimeQueryOptions
  ): Promise<any> {
    try {
      console.log(`📖 Getting data with query from: ${path}`, options);

      const baseRef = ref(rtdb, path);
      const queryRef = this.buildQuery(baseRef, options);
      const snapshot = await get(queryRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`✅ Query data retrieved from ${path}`);
        return data;
      } else {
        console.log(`📭 No data found with query at ${path}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting data with query from ${path}:`, error);
      throw error;
    }
  }

  /**
   * Establece datos en un path (sobrescribe)
   */
  async setDataByPath(path: string, data: any): Promise<boolean> {
    try {
      console.log(`📝 Setting data at: ${path}`);

      const dbRef = ref(rtdb, path);
      await set(dbRef, data);

      console.log(`✅ Data set successfully at ${path}`);
      return true;
    } catch (error) {
      console.error(`❌ Error setting data at ${path}:`, error);
      return false;
    }
  }

  /**
   * Actualiza datos en un path (merge)
   */
  async updateDataByPath(path: string, data: any): Promise<boolean> {
    try {
      console.log(`🔄 Updating data at: ${path}`);

      const dbRef = ref(rtdb, path);
      await update(dbRef, data);

      console.log(`✅ Data updated successfully at ${path}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating data at ${path}:`, error);
      return false;
    }
  }

  /**
   * Elimina datos de un path
   */
  async deleteDataByPath(path: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting data at: ${path}`);

      const dbRef = ref(rtdb, path);
      await remove(dbRef);

      console.log(`✅ Data deleted successfully at ${path}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting data at ${path}:`, error);
      return false;
    }
  }

  /**
   * Agrega un nuevo elemento con push key automática
   */
  async pushData(path: string, data: any): Promise<string | null> {
    try {
      console.log(`📤 Pushing data to: ${path}`);

      const dbRef = ref(rtdb, path);
      const newRef = push(dbRef, data);

      console.log(
        `✅ Data pushed successfully to ${path} with key: ${newRef.key}`
      );
      return newRef.key;
    } catch (error) {
      console.error(`❌ Error pushing data to ${path}:`, error);
      return null;
    }
  }

  /**
   * Verifica si existe un path
   */
  async pathExists(path: string): Promise<boolean> {
    try {
      const data = await this.getDataByPath(path);
      return data !== null;
    } catch (error) {
      console.error(`❌ Error checking if path exists ${path}:`, error);
      return false;
    }
  }

  // ========================================
  // REAL-TIME LISTENERS
  // ========================================

  /**
   * Escucha cambios en tiempo real en un path
   */
  listenToPath(
    path: string,
    callback: (data: any, snapshot: DataSnapshot) => void,
    onError?: (error: any) => void,
    options?: ListenerOptions
  ): Unsubscribe {
    console.log(`👂 Setting up listener for: ${path}`, options);

    try {
      const baseRef = ref(rtdb, path);
      const queryRef = options ? this.buildQuery(baseRef, options) : baseRef;

      const unsubscribe = onValue(
        queryRef,
        (snapshot) => {
          const data = snapshot.val();
          console.log(`📡 Data changed at ${path}`);
          callback(data, snapshot);
        },
        (error) => {
          console.error(`❌ Error listening to ${path}:`, error);
          if (onError) onError(error);
        }
      );

      return () => {
        off(queryRef, "value", unsubscribe);
        console.log(`🔌 Listener disconnected from ${path}`);
      };
    } catch (error) {
      console.error(`❌ Error setting up listener for ${path}:`, error);
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Escucha cambios de un valor específico
   */
  listenToValue(
    path: string,
    callback: (value: any) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    return this.listenToPath(path, (data) => callback(data), onError);
  }

  /**
   * Escucha cuando se agregan elementos
   */
  listenToChildAdded(
    path: string,
    callback: (data: any, key: string, prevChildKey?: string | null) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    console.log(`👂 Setting up child_added listener for: ${path}`);

    try {
      const baseRef = ref(rtdb, path);
      const queryRef = options ? this.buildQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildAdded(
        queryRef,
        (snapshot, prevChildKey) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          console.log(`📡 Child added at ${path}/${key}`);
          callback(data, key, prevChildKey);
        },
        (error) => {
          console.error(`❌ Error listening to child_added at ${path}:`, error);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        `❌ Error setting up child_added listener for ${path}:`,
        error
      );
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Escucha cuando se cambian elementos
   */
  listenToChildChanged(
    path: string,
    callback: (data: any, key: string, prevChildKey?: string | null) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    console.log(`👂 Setting up child_changed listener for: ${path}`);

    try {
      const baseRef = ref(rtdb, path);
      const queryRef = options ? this.buildQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildChanged(
        queryRef,
        (snapshot, prevChildKey) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          console.log(`📡 Child changed at ${path}/${key}`);
          callback(data, key, prevChildKey);
        },
        (error) => {
          console.error(
            `❌ Error listening to child_changed at ${path}:`,
            error
          );
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        `❌ Error setting up child_changed listener for ${path}:`,
        error
      );
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Escucha cuando se eliminan elementos
   */
  listenToChildRemoved(
    path: string,
    callback: (data: any, key: string) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    console.log(`👂 Setting up child_removed listener for: ${path}`);

    try {
      const baseRef = ref(rtdb, path);
      const queryRef = options ? this.buildQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildRemoved(
        queryRef,
        (snapshot) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          console.log(`📡 Child removed at ${path}/${key}`);
          callback(data, key);
        },
        (error) => {
          console.error(
            `❌ Error listening to child_removed at ${path}:`,
            error
          );
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        `❌ Error setting up child_removed listener for ${path}:`,
        error
      );
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Escucha cuando se mueven elementos
   */
  listenToChildMoved(
    path: string,
    callback: (data: any, key: string, prevChildKey?: string | null) => void,
    onError?: (error: any) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    console.log(`👂 Setting up child_moved listener for: ${path}`);

    try {
      const baseRef = ref(rtdb, path);
      const queryRef = options ? this.buildQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildMoved(
        queryRef,
        (snapshot, prevChildKey) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          console.log(`📡 Child moved at ${path}/${key}`);
          callback(data, key, prevChildKey);
        },
        (error) => {
          console.error(`❌ Error listening to child_moved at ${path}:`, error);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        `❌ Error setting up child_moved listener for ${path}:`,
        error
      );
      if (onError) onError(error);
      return () => {};
    }
  }

  // ========================================
  // ADVANCED QUERY OPERATIONS
  // ========================================

  /**
   * Obtiene elementos paginados
   */
  async getPaginatedData(
    path: string,
    pageSize: number,
    startAfterKey?: string,
    options?: RealtimeQueryOptions
  ): Promise<PaginatedResult> {
    try {
      console.log(`📄 Getting paginated data from ${path}`, {
        pageSize,
        startAfterKey,
      });

      const baseRef = ref(rtdb, path);
      let queryRef: Query = baseRef;

      // Aplicar opciones de query base
      if (options) {
        queryRef = this.buildQuery(queryRef, options);
      }

      // Aplicar paginación
      queryRef = query(queryRef, limitToFirst(pageSize + 1)); // +1 para determinar si hay más

      if (startAfterKey) {
        queryRef = query(queryRef, startAfter(startAfterKey));
      }

      const snapshot = await get(queryRef);
      const data = this.snapshotToArray(snapshot, true);

      const hasMore = data.length > pageSize;
      const actualData = hasMore ? data.slice(0, pageSize) : data;
      const lastKey =
        actualData.length > 0
          ? actualData[actualData.length - 1].key
          : undefined;

      const result: PaginatedResult = {
        data: actualData,
        pagination: {
          lastKey,
          hasMore,
          pageSize,
        },
      };

      console.log(
        `📊 Paginated result: ${actualData.length} items, hasMore: ${hasMore}`
      );
      return result;
    } catch (error) {
      console.error(`❌ Error getting paginated data from ${path}:`, error);
      throw error;
    }
  }

  /**
   * Escucha datos paginados en tiempo real
   */
  listenToPaginatedData(
    path: string,
    pageSize: number,
    callback: (result: PaginatedResult) => void,
    onError?: (error: any) => void,
    startAfterKey?: string,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    console.log(`👂 Setting up paginated listener for: ${path}`);

    try {
      const baseRef = ref(rtdb, path);
      let queryRef: Query = baseRef;

      if (options) {
        queryRef = this.buildQuery(queryRef, options);
      }

      queryRef = query(queryRef, limitToFirst(pageSize + 1));

      if (startAfterKey) {
        queryRef = query(queryRef, startAfter(startAfterKey));
      }

      const unsubscribe = onValue(
        queryRef,
        (snapshot) => {
          const data = this.snapshotToArray(snapshot, true);
          const hasMore = data.length > pageSize;
          const actualData = hasMore ? data.slice(0, pageSize) : data;
          const lastKey =
            actualData.length > 0
              ? actualData[actualData.length - 1].key
              : undefined;

          const result: PaginatedResult = {
            data: actualData,
            pagination: {
              lastKey,
              hasMore,
              pageSize,
            },
          };

          console.log(`📡 Paginated data changed at ${path}`);
          callback(result);
        },
        (error) => {
          console.error(`❌ Error in paginated listener for ${path}:`, error);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        `❌ Error setting up paginated listener for ${path}:`,
        error
      );
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Busca elementos por valor en un campo específico
   */
  async searchByChildValue(
    path: string,
    childKey: string,
    searchValue: any,
    options?: Omit<RealtimeQueryOptions, "orderByChild" | "equalTo">
  ): Promise<any> {
    try {
      console.log(`🔍 Searching in ${path} for ${childKey} = ${searchValue}`);

      const searchOptions: RealtimeQueryOptions = {
        ...options,
        orderByChild: childKey,
        equalTo: searchValue,
      };

      return await this.getDataWithQuery(path, searchOptions);
    } catch (error) {
      console.error(`❌ Error searching by child value in ${path}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene elementos en un rango de valores
   */
  async getDataInRange(
    path: string,
    childKey: string,
    startValue: any,
    endValue: any,
    options?: Omit<RealtimeQueryOptions, "orderByChild" | "startAt" | "endAt">
  ): Promise<any> {
    try {
      console.log(
        `📊 Getting range data from ${path} for ${childKey}: ${startValue} to ${endValue}`
      );

      const rangeOptions: RealtimeQueryOptions = {
        ...options,
        orderByChild: childKey,
        startAt: startValue,
        endAt: endValue,
      };

      return await this.getDataWithQuery(path, rangeOptions);
    } catch (error) {
      console.error(`❌ Error getting range data from ${path}:`, error);
      throw error;
    }
  }

  /**
   * Cuenta elementos en una colección
   */
  async countItems(
    path: string,
    options?: RealtimeQueryOptions
  ): Promise<number> {
    try {
      console.log(`🔢 Counting items at ${path}`);

      const data = options
        ? await this.getDataWithQuery(path, options)
        : await this.getDataByPath(path);

      if (!data) {
        return 0;
      }

      const count = typeof data === "object" ? Object.keys(data).length : 1;
      console.log(`📊 Count result: ${count} items`);
      return count;
    } catch (error) {
      console.error(`❌ Error counting items at ${path}:`, error);
      throw error;
    }
  }

  // ========================================
  // BATCH OPERATIONS
  // ========================================

  /**
   * Ejecuta múltiples operaciones de forma atómica
   */
  async executeBatchOperations(
    operations: BatchOperation[]
  ): Promise<BatchResult> {
    console.log(`🔄 Executing ${operations.length} batch operations`);

    const successful: string[] = [];
    const failed: Array<{ path: string; error: any; operation: string }> = [];

    try {
      // Construir objeto de updates para operación atómica
      const updates: { [path: string]: any } = {};

      for (const operation of operations) {
        try {
          switch (operation.operation) {
            case "set":
            case "update":
              updates[operation.path] = operation.data;
              break;
            case "remove":
              updates[operation.path] = null;
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
        } catch (error) {
          failed.push({
            path: operation.path,
            error,
            operation: operation.operation,
          });
        }
      }

      // Ejecutar todas las operaciones de forma atómica
      if (Object.keys(updates).length > 0) {
        const dbRef = ref(rtdb);
        await update(dbRef, updates);
        successful.push(...Object.keys(updates));
      }

      const result: BatchResult = {
        successful,
        failed,
        totalOperations: operations.length,
        successCount: successful.length,
        failureCount: failed.length,
      };

      console.log(`📊 Batch operations completed:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error executing batch operations:`, error);

      // Marcar todas las operaciones como fallidas si la operación atómica falla
      const allFailed = operations.map((op) => ({
        path: op.path,
        error,
        operation: op.operation,
      }));

      return {
        successful: [],
        failed: allFailed,
        totalOperations: operations.length,
        successCount: 0,
        failureCount: operations.length,
      };
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

      const dbRef = ref(rtdb);
      await update(dbRef, updates);

      console.log(`✅ Multi-path update completed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error in multi-path update:`, error);
      return false;
    }
  }

  // ========================================
  // TRANSACTION OPERATIONS
  // ========================================

  /**
   * Ejecuta una transacción
   */
  async executeTransaction(
    transaction: RealtimeTransaction
  ): Promise<TransactionResult> {
    try {
      console.log(`🔄 Executing transaction at: ${transaction.path}`);

      const dbRef = ref(rtdb, transaction.path);
      const result: FirebaseTransactionResult = await runTransaction(
        dbRef,
        transaction.updateFunction,
        {
          applyLocally: transaction.applyLocally ?? true,
        }
      );

      const transactionResult: TransactionResult = {
        committed: result.committed,
        snapshot: result.snapshot,
        value: result.snapshot?.val() || null,
      };

      console.log(`✅ Transaction completed:`, transactionResult);
      return transactionResult;
    } catch (error) {
      console.error(
        `❌ Error executing transaction at ${transaction.path}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Incrementa un valor numérico de forma atómica
   */
  async incrementValue(path: string, increment: number): Promise<number> {
    try {
      console.log(`📈 Incrementing value at ${path} by ${increment}`);

      const transaction: RealtimeTransaction = {
        path,
        updateFunction: (currentValue) => {
          const currentNum =
            typeof currentValue === "number" ? currentValue : 0;
          return currentNum + increment;
        },
      };

      const result = await this.executeTransaction(transaction);

      if (result.committed) {
        console.log(`✅ Value incremented to: ${result.value}`);
        return result.value;
      } else {
        throw new Error("Transaction was not committed");
      }
    } catch (error) {
      console.error(`❌ Error incrementing value at ${path}:`, error);
      throw error;
    }
  }

  /**
   * Agrega elemento a un array de forma atómica
   */
  async appendToArray(path: string, item: any): Promise<boolean> {
    try {
      console.log(`📝 Appending item to array at ${path}`);

      const transaction: RealtimeTransaction = {
        path,
        updateFunction: (currentArray) => {
          const array = Array.isArray(currentArray) ? currentArray : [];
          return [...array, item];
        },
      };

      const result = await this.executeTransaction(transaction);

      console.log(`✅ Item appended to array: ${result.committed}`);
      return result.committed;
    } catch (error) {
      console.error(`❌ Error appending to array at ${path}:`, error);
      return false;
    }
  }

  /**
   * Remueve elemento de un array de forma atómica
   */
  async removeFromArray(path: string, index: number): Promise<boolean> {
    try {
      console.log(`🗑️ Removing item at index ${index} from array at ${path}`);

      const transaction: RealtimeTransaction = {
        path,
        updateFunction: (currentArray) => {
          const array = Array.isArray(currentArray) ? currentArray : [];
          if (index >= 0 && index < array.length) {
            return array.filter((_, i) => i !== index);
          }
          return array;
        },
      };

      const result = await this.executeTransaction(transaction);

      console.log(`✅ Item removed from array: ${result.committed}`);
      return result.committed;
    } catch (error) {
      console.error(`❌ Error removing from array at ${path}:`, error);
      return false;
    }
  }

  // ========================================
  // CONNECTION AND PRESENCE
  // ========================================

  /**
   * Obtiene el estado de conexión
   */
  async getConnectionState(): Promise<ConnectionState> {
    try {
      const connectedRef = ref(rtdb, ".info/connected");
      const offsetRef = ref(rtdb, ".info/serverTimeOffset");

      const [connectedSnapshot, offsetSnapshot] = await Promise.all([
        get(connectedRef),
        get(offsetRef),
      ]);

      const state: ConnectionState = {
        connected: connectedSnapshot.val() === true,
        serverTimeOffset: offsetSnapshot.val() || 0,
      };

      console.log(`🔗 Connection state:`, state);
      return state;
    } catch (error) {
      console.error(`❌ Error getting connection state:`, error);
      return { connected: false, serverTimeOffset: 0 };
    }
  }

  /**
   * Escucha cambios en el estado de conexión
   */
  listenToConnectionState(
    callback: (state: ConnectionState) => void
  ): Unsubscribe {
    console.log(`👂 Setting up connection state listener`);

    const connectedRef = ref(rtdb, ".info/connected");
    const offsetRef = ref(rtdb, ".info/serverTimeOffset");

    let connected = false;
    let serverTimeOffset = 0;

    const connectedUnsubscribe = onValue(connectedRef, (snapshot) => {
      connected = snapshot.val() === true;
      callback({ connected, serverTimeOffset });
    });

    const offsetUnsubscribe = onValue(offsetRef, (snapshot) => {
      serverTimeOffset = snapshot.val() || 0;
      callback({ connected, serverTimeOffset });
    });

    return () => {
      connectedUnsubscribe();
      offsetUnsubscribe();
      console.log(`🔌 Connection state listener disconnected`);
    };
  }

  /**
   * Obtiene el timestamp del servidor
   */
  async getServerTimestamp(): Promise<number> {
    try {
      const offsetRef = ref(rtdb, ".info/serverTimeOffset");
      const offsetSnapshot = await get(offsetRef);
      const offset = offsetSnapshot.val() || 0;

      const serverTime = Date.now() + offset;
      console.log(`⏰ Server timestamp: ${serverTime}`);
      return serverTime;
    } catch (error) {
      console.error(`❌ Error getting server timestamp:`, error);
      return Date.now();
    }
  }

  /**
   * Configura presencia para un usuario
   */
  async setUserPresence(userId: string, presenceData: any): Promise<boolean> {
    try {
      console.log(`👤 Setting presence for user: ${userId}`);

      const userPresenceRef = ref(rtdb, `presence/users/${userId}`);
      const userConnectionRef = ref(rtdb, `presence/connections/${userId}`);

      // Configurar datos de presencia
      const presenceInfo = {
        ...presenceData,
        isOnline: true,
        lastSeen: serverTimestamp(),
        connectedAt: serverTimestamp(),
      };

      // Configurar desconexión automática
      const disconnectRef = onDisconnect(userPresenceRef);
      await disconnectRef.set({
        ...presenceData,
        isOnline: false,
        lastSeen: serverTimestamp(),
      });

      // Configurar desconexión de la lista de conexiones
      const connectionDisconnectRef = onDisconnect(userConnectionRef);
      await connectionDisconnectRef.remove();

      // Establecer presencia actual
      await set(userPresenceRef, presenceInfo);
      await set(userConnectionRef, true);

      console.log(`✅ Presence set for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error setting presence for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Escucha la presencia de un usuario
   */
  listenToUserPresence(
    userId: string,
    callback: (presence: PresenceInfo) => void
  ): Unsubscribe {
    console.log(`👂 Setting up presence listener for user: ${userId}`);

    const userPresenceRef = ref(rtdb, `presence/users/${userId}`);
    const connectionsRef = ref(rtdb, `presence/connections`);

    let userPresence: any = {};
    let connections: any = {};

    const presenceUnsubscribe = onValue(userPresenceRef, (snapshot) => {
      userPresence = snapshot.val() || {};

      const presenceInfo: PresenceInfo = {
        isOnline: userPresence.isOnline || false,
        lastSeen: userPresence.lastSeen || 0,
        connections,
      };

      callback(presenceInfo);
    });

    const connectionsUnsubscribe = onValue(connectionsRef, (snapshot) => {
      connections = snapshot.val() || {};

      const presenceInfo: PresenceInfo = {
        isOnline: userPresence.isOnline || false,
        lastSeen: userPresence.lastSeen || 0,
        connections,
      };

      callback(presenceInfo);
    });

    return () => {
      presenceUnsubscribe();
      connectionsUnsubscribe();
      console.log(`🔌 Presence listener disconnected for user: ${userId}`);
    };
  }

  /**
   * Obtiene usuarios conectados
   */
  async getOnlineUsers(path: string): Promise<string[]> {
    try {
      console.log(`👥 Getting online users from: ${path}`);

      const data = await this.getDataByPath(path);
      if (!data) {
        return [];
      }

      const onlineUsers = Object.keys(data).filter((userId) => {
        const userData = data[userId];
        return userData && userData.isOnline === true;
      });

      console.log(`📊 Found ${onlineUsers.length} online users`);
      return onlineUsers;
    } catch (error) {
      console.error(`❌ Error getting online users from ${path}:`, error);
      return [];
    }
  }

  /**
   * Escucha usuarios conectados en tiempo real
   */
  listenToOnlineUsers(
    path: string,
    callback: (users: string[]) => void
  ): Unsubscribe {
    console.log(`👂 Setting up online users listener for: ${path}`);

    return this.listenToPath(path, (data) => {
      if (!data) {
        callback([]);
        return;
      }

      const onlineUsers = Object.keys(data).filter((userId) => {
        const userData = data[userId];
        return userData && userData.isOnline === true;
      });

      console.log(`📡 Online users changed: ${onlineUsers.length} users`);
      callback(onlineUsers);
    });
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Obtiene referencia de la base de datos
   */
  getDatabaseReference(path?: string): DatabaseReference {
    return path ? ref(rtdb, path) : ref(rtdb);
  }

  /**
   * Genera una nueva push key
   */
  generatePushKey(path: string): string {
    const dbRef = ref(rtdb, path);
    const newRef = push(dbRef);
    return newRef.key!;
  }

  /**
   * Valida un path de Firebase
   */
  validatePath(path: string): boolean {
    // Firebase paths no pueden contener ciertos caracteres
    const invalidChars = /[.#$\[\]]/;
    if (invalidChars.test(path)) {
      return false;
    }

    // No puede empezar o terminar con /
    if (path.startsWith("/") || path.endsWith("/")) {
      return false;
    }

    // No puede tener // consecutivos
    if (path.includes("//")) {
      return false;
    }

    return true;
  }

  /**
   * Convierte datos de Firebase a objeto plano
   */
  snapshotToObject(snapshot: DataSnapshot): any {
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.val();
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return { ...data };
    }

    return data;
  }

  /**
   * Convierte datos de Firebase a array
   */
  snapshotToArray(snapshot: DataSnapshot, includeKeys: boolean = false): any[] {
    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    if (typeof data !== "object" || data === null) {
      return [data];
    }

    return Object.keys(data).map((key) => {
      const item = data[key];
      return includeKeys ? { key, ...item } : item;
    });
  }

  /**
   * Desconecta todos los listeners activos
   */
  disconnectAllListeners(unsubscribeFunctions: Unsubscribe[]): void {
    console.log(`🔌 Disconnecting ${unsubscribeFunctions.length} listeners`);

    unsubscribeFunctions.forEach((unsubscribe, index) => {
      try {
        unsubscribe();
        console.log(`✅ Listener ${index + 1} disconnected`);
      } catch (error) {
        console.error(`❌ Error disconnecting listener ${index + 1}:`, error);
      }
    });
  }

  /**
   * Limpia cache local
   */
  async clearCache(): Promise<boolean> {
    try {
      // Firebase Realtime Database no tiene una API específica para limpiar cache
      // Pero podemos forzar una reconexión
      goOffline(rtdb);
      await new Promise((resolve) => setTimeout(resolve, 100));
      goOnline(rtdb);

      console.log(`✅ Cache cleared and reconnected`);
      return true;
    } catch (error) {
      console.error(`❌ Error clearing cache:`, error);
      return false;
    }
  }

  /**
   * Habilita/deshabilita persistencia offline
   */
  async setPersistenceEnabled(enabled: boolean): Promise<boolean> {
    try {
      // Firebase Realtime Database tiene persistencia habilitada por defecto
      // Esta función es más conceptual para mantener consistencia con la interfaz
      console.log(`📱 Persistence ${enabled ? "enabled" : "disabled"}`);
      return true;
    } catch (error) {
      console.error(`❌ Error setting persistence:`, error);
      return false;
    }
  }

  // ========================================
  // SECURITY AND VALIDATION
  // ========================================

  /**
   * Valida estructura de datos antes de guardar
   */
  validateData(data: any, schema?: any): boolean {
    try {
      // Validaciones básicas
      if (data === undefined) {
        console.warn(`⚠️ Data is undefined`);
        return false;
      }

      // Validar que no contenga caracteres especiales de Firebase en las keys
      if (typeof data === "object" && data !== null) {
        const invalidKeyPattern = /[.#$\[\]]/;

        const checkKeys = (obj: any): boolean => {
          for (const key in obj) {
            if (invalidKeyPattern.test(key)) {
              console.warn(`⚠️ Invalid key: ${key}`);
              return false;
            }

            if (typeof obj[key] === "object" && obj[key] !== null) {
              if (!checkKeys(obj[key])) {
                return false;
              }
            }
          }
          return true;
        };

        if (!checkKeys(data)) {
          return false;
        }
      }

      // Validación con schema si se proporciona
      if (schema) {
        // Implementar validación de schema según necesidades
        // Por ejemplo, usando una librería como Joi o Yup
        console.log(`📋 Schema validation not implemented`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error validating data:`, error);
      return false;
    }
  }

  /**
   * Sanitiza datos antes de guardar
   */
  sanitizeData(data: any): any {
    try {
      if (data === null || data === undefined) {
        return data;
      }

      if (typeof data === "string") {
        // Escapar caracteres especiales
        return data.replace(/[<>]/g, "");
      }

      if (typeof data === "object") {
        const sanitized: any = Array.isArray(data) ? [] : {};

        for (const key in data) {
          // Sanitizar keys
          const sanitizedKey = key.replace(/[.#$\[\]]/g, "_");
          sanitized[sanitizedKey] = this.sanitizeData(data[key]);
        }

        return sanitized;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error sanitizing data:`, error);
      return data;
    }
  }

  /**
   * Obtiene información de seguridad del path
   */
  async getSecurityInfo(
    path: string
  ): Promise<{ readable: boolean; writable: boolean }> {
    try {
      console.log(`🔒 Checking security info for: ${path}`);

      // Intentar leer para verificar permisos de lectura
      let readable = false;
      try {
        await this.getDataByPath(path);
        readable = true;
      } catch (error) {
        // Error puede indicar falta de permisos o path no existe
        readable = false;
      }

      // Intentar escribir para verificar permisos de escritura
      let writable = false;
      try {
        const testPath = `${path}/.security_test`;
        await this.setDataByPath(testPath, true);
        await this.deleteDataByPath(testPath);
        writable = true;
      } catch (error) {
        writable = false;
      }

      const securityInfo = { readable, writable };
      console.log(`🔒 Security info for ${path}:`, securityInfo);
      return securityInfo;
    } catch (error) {
      console.error(`❌ Error getting security info for ${path}:`, error);
      return { readable: false, writable: false };
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Construye un query basado en las opciones proporcionadas
   */
  private buildQuery(
    baseRef: DatabaseReference | Query,
    options: RealtimeQueryOptions
  ): Query {
    let queryRef: Query = baseRef;

    // Aplicar ordenamiento
    if (options.orderBy === "child" && options.orderByChild) {
      queryRef = query(queryRef, orderByChild(options.orderByChild));
    } else if (options.orderBy === "key") {
      queryRef = query(queryRef, orderByKey());
    } else if (options.orderBy === "value") {
      queryRef = query(queryRef, orderByValue());
    }

    // Aplicar filtros
    if (options.equalTo !== undefined) {
      queryRef = query(queryRef, equalTo(options.equalTo));
    }

    if (options.startAt !== undefined) {
      queryRef = query(queryRef, startAt(options.startAt));
    }

    if (options.endAt !== undefined) {
      queryRef = query(queryRef, endAt(options.endAt));
    }

    if (options.startAfter !== undefined) {
      queryRef = query(queryRef, startAfter(options.startAfter));
    }

    if (options.endBefore !== undefined) {
      queryRef = query(queryRef, endBefore(options.endBefore));
    }

    // Aplicar límites
    if (options.limitToFirst) {
      queryRef = query(queryRef, limitToFirst(options.limitToFirst));
    }

    if (options.limitToLast) {
      queryRef = query(queryRef, limitToLast(options.limitToLast));
    }

    return queryRef;
  }
}

export default FirebaseRealtimeService;
