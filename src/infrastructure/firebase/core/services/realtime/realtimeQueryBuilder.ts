import {
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
  DatabaseReference,
  Query,
} from "firebase/database";
import { RealtimeQueryOptions } from "./RealtimeTypes";

export function buildRealtimeQuery(
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

  // Aplicar limites
  if (options.limitToFirst) {
    queryRef = query(queryRef, limitToFirst(options.limitToFirst));
  }

  if (options.limitToLast) {
    queryRef = query(queryRef, limitToLast(options.limitToLast));
  }

  return queryRef;
}
