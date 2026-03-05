import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  getCountFromServer,
  DocumentData,
  Timestamp,
  FieldValue,
  DocumentReference,
  CollectionReference,
  Query,
  AggregateQuerySnapshot,
  AggregateField,
  Firestore,
} from "firebase/firestore";
import { FirestoreQueryOptions } from "./FirestoreTypes";
import { buildFirestoreQuery } from "./firestoreQueryBuilder";
import { mapFirestoreError } from '../../errors/FirestoreException';

@injectable()
export class FirestoreCrudService {
  constructor(@inject(DI_TOKENS.FirestoreInstance) private readonly db: Firestore) {}

  async getMaxId(collectionName: string): Promise<number> {
    try {
      const q = query(
        collection(this.db, collectionName),
        orderBy("id", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return docSnap.data().id ?? 0;
      }

      return 0;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async getDocumentById(
    collectionName: string,
    docId: string
  ): Promise<DocumentData | null> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async getDocuments(
    collectionName: string,
    options?: FirestoreQueryOptions
  ): Promise<DocumentData[]> {
    try {
      const q = buildFirestoreQuery(this.db, collectionName, options);
      const querySnapshot = await getDocs(q);

      const documents = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      return documents;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async addDocument(collectionName: string, data: Record<string, unknown>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async setDocument(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>,
    merge: boolean = false
  ): Promise<boolean> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const dataWithTimestamp: Record<string, unknown> = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (!merge) {
        dataWithTimestamp.createdAt = serverTimestamp();
      }

      await setDoc(docRef, dataWithTimestamp, { merge });

      return true;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async updateDocument(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<boolean> {
    try {
      await deleteDoc(doc(this.db, collectionName, docId));
      return true;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async documentExists(
    collectionName: string,
    docId: string
  ): Promise<boolean> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      return false;
    }
  }

  async getDocumentCount(
    collectionName: string,
    options?: FirestoreQueryOptions
  ): Promise<number> {
    try {
      const q = buildFirestoreQuery(this.db, collectionName, options);
      const snapshot: AggregateQuerySnapshot<{ count: AggregateField<number> }> = await getCountFromServer(q);
      const count = snapshot.data().count as number;

      return count;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async updateArrayField(
    collectionName: string,
    docId: string,
    fieldName: string,
    operation: "add" | "remove",
    values: unknown[]
  ): Promise<boolean> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };

      if (operation === "add") {
        updateData[fieldName] = arrayUnion(...values);
      } else {
        updateData[fieldName] = arrayRemove(...values);
      }

      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  async incrementField(
    collectionName: string,
    docId: string,
    fieldName: string,
    value: number
  ): Promise<boolean> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, {
        [fieldName]: increment(value),
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      throw mapFirestoreError(error);
    }
  }

  getServerTimestamp(): FieldValue {
    return serverTimestamp();
  }

  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  getDocumentReference(
    collectionName: string,
    docId: string
  ): DocumentReference {
    return doc(this.db, collectionName, docId);
  }

  getCollectionReference(collectionName: string): CollectionReference {
    return collection(this.db, collectionName);
  }

  generateDocumentId(): string {
    return doc(collection(this.db, "temp")).id;
  }
}
