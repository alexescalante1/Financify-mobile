import {
  collection,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
  startAfter,
  endBefore,
  Query,
  Firestore,
} from "firebase/firestore";
import { FirestoreQueryOptions } from "./FirestoreTypes";

export function buildFirestoreQuery(
  db: Firestore,
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

    // Aplicar limites
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    if (options.limitToLast) {
      q = query(q, limitToLast(options.limitToLast));
    }

    // Aplicar cursores de paginacion
    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }

    if (options.endBefore) {
      q = query(q, endBefore(options.endBefore));
    }
  }

  return q;
}
