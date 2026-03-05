import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  DocumentData,
  QueryDocumentSnapshot,
  Query,
  Firestore,
} from "firebase/firestore";
import { FirestoreQueryOptions, PaginationOptions } from "./FirestoreTypes";
import { buildFirestoreQuery } from "./firestoreQueryBuilder";

@injectable()
export class FirestoreQueryService {
  constructor(@inject(DI_TOKENS.FirestoreInstance) private readonly db: Firestore) {}

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
      let q = buildFirestoreQuery(this.db, collectionName, options);

      // Aplicar paginacion
      const pageSize = options.pageSize;
      q = query(q, limit(pageSize + 1)); // +1 para determinar si hay mas paginas

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
      const documents = docs.slice(0, pageSize).map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const lastDoc = documents.length > 0 ? docs[documents.length - 1] : null;
      const firstDoc = documents.length > 0 ? docs[0] : null;
      const hasPrevious = !!options.lastDoc;

      return {
        documents,
        lastDoc,
        firstDoc,
        hasNext,
        hasPrevious,
      };
    } catch (error) {
      throw error;
    }
  }

  async searchDocuments(
    collectionName: string,
    field: string,
    searchTerm: string,
    options?: FirestoreQueryOptions
  ): Promise<DocumentData[]> {
    try {
      let q: Query = collection(this.db, collectionName);

      // Aplicar busqueda de texto (metodo basico)
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
      const results = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      return results;
    } catch (error) {
      throw error;
    }
  }
}
