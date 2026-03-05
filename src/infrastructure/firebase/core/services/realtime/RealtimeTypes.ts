import { DataSnapshot } from "firebase/database";

export interface RealtimeQueryOptions {
  orderBy?: 'child' | 'key' | 'value';
  orderByChild?: string;
  orderByChildKey?: string;
  limitToFirst?: number;
  limitToLast?: number;
  equalTo?: number | string | boolean | null;
  startAt?: number | string | boolean | null;
  endAt?: number | string | boolean | null;
  startAfter?: number | string | boolean | null;
  endBefore?: number | string | boolean | null;
}

export interface ListenerOptions extends RealtimeQueryOptions {
  onlyOnce?: boolean;
}

export interface BatchOperation {
  path: string;
  value?: unknown;
  data?: unknown;
  type?: 'set' | 'update' | 'remove';
  operation?: 'set' | 'update' | 'remove';
}

export interface BatchResult {
  success?: boolean;
  successful?: string[];
  failed?: Array<{ path: string; error: unknown; operation?: string }>;
  errors?: unknown[];
  totalOperations?: number;
  successCount?: number;
  failureCount?: number;
}

export interface RealtimeTransaction {
  path: string;
  updateFunction: (currentValue: unknown) => unknown;
  applyLocally?: boolean;
}

export interface TransactionResult {
  committed: boolean;
  snapshot: DataSnapshot;
  value?: unknown;
}

export interface PaginationState {
  lastKey?: string;
  pageSize: number;
}

export interface PaginatedResult {
  data: unknown[];
  pagination?: { lastKey?: string; hasMore: boolean; pageSize: number };
  lastKey?: string;
  hasMore?: boolean;
}

export interface ConnectionState {
  connected: boolean;
  serverTimeOffset?: number;
}

export interface PresenceInfo {
  online?: boolean;
  isOnline?: boolean;
  lastSeen?: number;
  connections?: unknown;
}
