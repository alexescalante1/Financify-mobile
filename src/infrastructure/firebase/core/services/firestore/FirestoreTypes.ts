import {
  WhereFilterOp,
  OrderByDirection,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export interface FirestoreQueryOptions {
  field?: string;
  operator?: WhereFilterOp;
  value?: unknown;
  where?: Array<{ field: string; operator: WhereFilterOp; value: unknown }>;
  orderBy?: Array<{ field: string; direction?: OrderByDirection }>;
  limit?: number;
  limitToLast?: number;
  startAfter?: unknown;
  endBefore?: unknown;
}

export interface PaginationOptions {
  pageSize: number;
  startAfterDoc?: DocumentSnapshot;
  lastDoc?: QueryDocumentSnapshot;
  direction?: 'next' | 'previous';
}

export interface BatchOperation {
  collectionName: string;
  docId: string;
  operation: 'set' | 'update' | 'delete';
  data?: Record<string, unknown>;
  merge?: boolean;
}

export interface ListenerOptions extends FirestoreQueryOptions {
  includeMetadataChanges?: boolean;
  includeMetadata?: boolean;
  includeDocChanges?: boolean;
}

export interface DateRangeOptions {
  field: string;
  startDate: Date;
  endDate: Date;
  orderByField?: string;
  orderDirection?: OrderByDirection;
  limit?: number;
}
