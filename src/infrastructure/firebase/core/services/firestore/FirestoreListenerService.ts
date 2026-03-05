import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Unsubscribe,
  QuerySnapshot,
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  Query,
  OrderByDirection,
  WhereFilterOp,
  FirestoreError,
  Firestore,
} from "firebase/firestore";
import {
  FirestoreQueryOptions,
  ListenerOptions,
  PaginationOptions,
  DateRangeOptions,
} from "./FirestoreTypes";
import { buildFirestoreQuery } from "./firestoreQueryBuilder";

@injectable()
export class FirestoreListenerService {
  constructor(@inject(DI_TOKENS.FirestoreInstance) private readonly db: Firestore) {}

  listenToDocument(
    collectionName: string,
    docId: string,
    callback: (data: DocumentData | null) => void,
    onError?: (error: FirestoreError) => void,
    includeMetadata: boolean = false
  ): Unsubscribe {
    const docRef = doc(this.db, collectionName, docId);

    return onSnapshot(
      docRef,
      { includeMetadataChanges: includeMetadata },
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() };
          callback(data);
        } else {
          callback(null);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  }

  listenToCollection(
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    onError?: (error: FirestoreError) => void,
    options?: ListenerOptions
  ): Unsubscribe {
    const q = buildFirestoreQuery(this.db, collectionName, options);

    return onSnapshot(
      q,
      {
        includeMetadataChanges: options?.includeMetadata || false,
      },
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (options?.includeDocChanges) {
          const changes = snapshot.docChanges().map((change) => ({
            type: change.type,
            doc: { id: change.doc.id, ...change.doc.data() },
            oldIndex: change.oldIndex,
            newIndex: change.newIndex,
          }));
        }

        callback(docs);
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  }

  listenToCollectionByDateRange(
    collectionName: string,
    dateField: string,
    startDate: Date,
    endDate: Date,
    callback: (data: DocumentData[]) => void,
    onError?: (error: FirestoreError) => void,
    options?: DateRangeOptions
  ): Unsubscribe {
    let q: Query = collection(this.db, collectionName);

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

    // Aplicar limite si se especifica
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        callback(docs);
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  }

  listenToCollectionWithFilters(
    collectionName: string,
    filters: Array<{ field: string; operator: WhereFilterOp; value: unknown }>,
    callback: (data: DocumentData[]) => void,
    onError?: (error: FirestoreError) => void,
    options?: Omit<ListenerOptions, "where">
  ): Unsubscribe {
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

  listenToLatestDocuments(
    collectionName: string,
    orderByField: string,
    limitCount: number,
    callback: (data: DocumentData[]) => void,
    onError?: (error: FirestoreError) => void,
    orderDirection: OrderByDirection = "desc"
  ): Unsubscribe {
    const options: ListenerOptions = {
      orderBy: [{ field: orderByField, direction: orderDirection }],
      limit: limitCount,
      includeDocChanges: true,
    };

    return this.listenToCollection(collectionName, callback, onError, options);
  }

  listenToPaginatedCollection(
    collectionName: string,
    options: PaginationOptions & ListenerOptions,
    callback: (data: {
      documents: DocumentData[];
      hasNext: boolean;
      hasPrevious: boolean;
    }) => void,
    onError?: (error: FirestoreError) => void
  ): Unsubscribe {
    let q = buildFirestoreQuery(this.db, collectionName, options);

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
        const documents = docs.slice(0, pageSize).map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        const hasPrevious = !!options.lastDoc;

        callback({
          documents,
          hasNext,
          hasPrevious,
        });
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  }

  listenToSearchResults(
    collectionName: string,
    field: string,
    searchTerm: string,
    callback: (data: DocumentData[]) => void,
    onError?: (error: FirestoreError) => void,
    options?: FirestoreQueryOptions
  ): Unsubscribe {
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
