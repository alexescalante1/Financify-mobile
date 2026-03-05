import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  ref,
  onValue,
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onChildMoved,
  Database,
  DataSnapshot,
  Unsubscribe,
} from "firebase/database";
import { RealtimeQueryOptions, ListenerOptions } from "./RealtimeTypes";
import { buildRealtimeQuery } from "./realtimeQueryBuilder";

@injectable()
export class RealtimeListenerService {
  constructor(@inject(DI_TOKENS.RealtimeDbInstance) private readonly rtdb: Database) {}

  listenToPath(
    path: string,
    callback: (data: unknown, snapshot: DataSnapshot) => void,
    onError?: (error: Error) => void,
    options?: ListenerOptions
  ): Unsubscribe {
    try {
      const baseRef = ref(this.rtdb, path);
      const queryRef = options ? buildRealtimeQuery(baseRef, options) : baseRef;

      const unsubscribe = onValue(
        queryRef,
        (snapshot) => {
          const data = snapshot.val();
          callback(data, snapshot);
        },
        (error) => {
          if (onError) onError(error);
        }
      );

      return () => {
        off(queryRef, "value", unsubscribe);
      };
    } catch (error) {
      if (onError) onError(error as Error);
      return () => {};
    }
  }

  listenToValue(
    path: string,
    callback: (value: unknown) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return this.listenToPath(path, (data) => callback(data), onError);
  }

  listenToChildAdded(
    path: string,
    callback: (data: unknown, key: string, prevChildKey?: string | null) => void,
    onError?: (error: Error) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    try {
      const baseRef = ref(this.rtdb, path);
      const queryRef = options ? buildRealtimeQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildAdded(
        queryRef,
        (snapshot, prevChildKey) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          callback(data, key, prevChildKey);
        },
        (error) => {
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      if (onError) onError(error as Error);
      return () => {};
    }
  }

  listenToChildChanged(
    path: string,
    callback: (data: unknown, key: string, prevChildKey?: string | null) => void,
    onError?: (error: Error) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    try {
      const baseRef = ref(this.rtdb, path);
      const queryRef = options ? buildRealtimeQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildChanged(
        queryRef,
        (snapshot, prevChildKey) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          callback(data, key, prevChildKey);
        },
        (error) => {
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      if (onError) onError(error as Error);
      return () => {};
    }
  }

  listenToChildRemoved(
    path: string,
    callback: (data: unknown, key: string) => void,
    onError?: (error: Error) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    try {
      const baseRef = ref(this.rtdb, path);
      const queryRef = options ? buildRealtimeQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildRemoved(
        queryRef,
        (snapshot) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          callback(data, key);
        },
        (error) => {
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      if (onError) onError(error as Error);
      return () => {};
    }
  }

  listenToChildMoved(
    path: string,
    callback: (data: unknown, key: string, prevChildKey?: string | null) => void,
    onError?: (error: Error) => void,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    try {
      const baseRef = ref(this.rtdb, path);
      const queryRef = options ? buildRealtimeQuery(baseRef, options) : baseRef;

      const unsubscribe = onChildMoved(
        queryRef,
        (snapshot, prevChildKey) => {
          const data = snapshot.val();
          const key = snapshot.key!;
          callback(data, key, prevChildKey);
        },
        (error) => {
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      if (onError) onError(error as Error);
      return () => {};
    }
  }

  disconnectAllListeners(unsubscribeFunctions: Unsubscribe[]): void {
    unsubscribeFunctions.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        // silent
      }
    });
  }
}
