import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  doc,
  serverTimestamp,
  writeBatch,
  runTransaction,
  Transaction,
  Firestore,
} from "firebase/firestore";
import { BatchOperation } from "./FirestoreTypes";

@injectable()
export class FirestoreBatchService {
  constructor(@inject(DI_TOKENS.FirestoreInstance) private readonly db: Firestore) {}

  async executeBatchOperations(operations: BatchOperation[]): Promise<boolean> {
    try {
      const batch = writeBatch(this.db);

      operations.forEach((operation) => {
        const docRef = doc(this.db, operation.collectionName, operation.docId);

        switch (operation.operation) {
          case "set":
            const setData: Record<string, unknown> = {
              ...operation.data,
              updatedAt: serverTimestamp(),
            };
            if (!operation.merge) {
              setData.createdAt = serverTimestamp();
            }
            batch.set(docRef, setData, { merge: operation.merge || false });
            break;

          case "update":
            batch.update(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp(),
            });
            break;

          case "delete":
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      throw error;
    }
  }

  async multiPathUpdate(updates: Record<string, unknown>): Promise<boolean> {
    try {
      const batch = writeBatch(this.db);

      // Procesar cada path del update
      Object.entries(updates).forEach(([path, value]) => {
        // El path puede ser "collectionName/docId" o "collectionName/docId/field"
        const pathParts = path.split("/");

        if (pathParts.length >= 2) {
          const collectionName = pathParts[0];
          const docId = pathParts[1];

          if (pathParts.length === 2) {
            // Update completo del documento: "users/123"
            const docRef = doc(this.db, collectionName, docId);
            if (value === null) {
              batch.delete(docRef);
            } else {
              const docData = value as Record<string, unknown>;
              batch.set(
                docRef,
                {
                  ...docData,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          } else {
            // Update de campo especifico: "users/123/isPrimary"
            const fieldPath = pathParts.slice(2).join(".");
            const docRef = doc(this.db, collectionName, docId);

            if (value === null) {
              batch.update(docRef, {
                [fieldPath]: value,
                updatedAt: serverTimestamp(),
              });
            } else {
              batch.update(docRef, {
                [fieldPath]: value,
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      return false;
    }
  }

  async executeTransaction<T>(
    transactionFunction: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    try {
      const result = await runTransaction(this.db, transactionFunction);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
