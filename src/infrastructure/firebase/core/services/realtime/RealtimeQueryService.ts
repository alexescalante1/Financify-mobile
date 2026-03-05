import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  ref,
  get,
  query,
  limitToFirst,
  startAfter,
  onValue,
  Database,
  Query,
  DataSnapshot,
  Unsubscribe,
} from "firebase/database";
import { RealtimeQueryOptions, PaginatedResult } from "./RealtimeTypes";
import { buildRealtimeQuery } from "./realtimeQueryBuilder";

@injectable()
export class RealtimeQueryService {
  constructor(@inject(DI_TOKENS.RealtimeDbInstance) private readonly rtdb: Database) {}

  private snapshotToArray(snapshot: DataSnapshot, includeKeys: boolean = false): unknown[] {
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

  async getPaginatedData(
    path: string,
    pageSize: number,
    startAfterKey?: string,
    options?: RealtimeQueryOptions
  ): Promise<PaginatedResult> {
    try {
      const baseRef = ref(this.rtdb, path);
      let queryRef: Query = baseRef;

      if (options) {
        queryRef = buildRealtimeQuery(queryRef, options);
      }

      queryRef = query(queryRef, limitToFirst(pageSize + 1));

      if (startAfterKey) {
        queryRef = query(queryRef, startAfter(startAfterKey));
      }

      const snapshot = await get(queryRef);
      const data = this.snapshotToArray(snapshot, true);

      const hasMore = data.length > pageSize;
      const actualData = hasMore ? data.slice(0, pageSize) : data;
      const lastKey =
        actualData.length > 0
          ? (actualData[actualData.length - 1] as Record<string, unknown>).key as string
          : undefined;

      return {
        data: actualData,
        pagination: {
          lastKey,
          hasMore,
          pageSize,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  listenToPaginatedData(
    path: string,
    pageSize: number,
    callback: (result: PaginatedResult) => void,
    onError?: (error: Error) => void,
    startAfterKey?: string,
    options?: RealtimeQueryOptions
  ): Unsubscribe {
    try {
      const baseRef = ref(this.rtdb, path);
      let queryRef: Query = baseRef;

      if (options) {
        queryRef = buildRealtimeQuery(queryRef, options);
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
              ? (actualData[actualData.length - 1] as Record<string, unknown>).key as string
              : undefined;

          callback({
            data: actualData,
            pagination: {
              lastKey,
              hasMore,
              pageSize,
            },
          });
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

  async searchByChildValue(
    path: string,
    childKey: string,
    searchValue: number | string | boolean | null,
    getDataWithQuery: (path: string, options: RealtimeQueryOptions) => Promise<unknown>,
    options?: Omit<RealtimeQueryOptions, "orderByChild" | "equalTo">
  ): Promise<unknown> {
    try {
      const searchOptions: RealtimeQueryOptions = {
        ...options,
        orderByChild: childKey,
        equalTo: searchValue,
      };
      return await getDataWithQuery(path, searchOptions);
    } catch (error) {
      throw error;
    }
  }

  async getDataInRange(
    path: string,
    childKey: string,
    startValue: number | string | boolean | null,
    endValue: number | string | boolean | null,
    getDataWithQuery: (path: string, options: RealtimeQueryOptions) => Promise<unknown>,
    options?: Omit<RealtimeQueryOptions, "orderByChild" | "startAt" | "endAt">
  ): Promise<unknown> {
    try {
      const rangeOptions: RealtimeQueryOptions = {
        ...options,
        orderByChild: childKey,
        startAt: startValue,
        endAt: endValue,
      };
      return await getDataWithQuery(path, rangeOptions);
    } catch (error) {
      throw error;
    }
  }

  async countItems(
    path: string,
    getDataByPath: (path: string) => Promise<unknown>,
    getDataWithQuery: (path: string, options: RealtimeQueryOptions) => Promise<unknown>,
    options?: RealtimeQueryOptions
  ): Promise<number> {
    try {
      const data = options
        ? await getDataWithQuery(path, options)
        : await getDataByPath(path);

      if (!data) {
        return 0;
      }

      return typeof data === "object" ? Object.keys(data as Record<string, unknown>).length : 1;
    } catch (error) {
      throw error;
    }
  }
}
