import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  ref,
  update,
  runTransaction,
  Database,
  TransactionResult as FirebaseTransactionResult,
} from "firebase/database";
import {
  BatchOperation,
  BatchResult,
  RealtimeTransaction,
  TransactionResult,
} from "./RealtimeTypes";

@injectable()
export class RealtimeBatchService {
  constructor(@inject(DI_TOKENS.RealtimeDbInstance) private readonly rtdb: Database) {}

  async executeBatchOperations(
    operations: BatchOperation[]
  ): Promise<BatchResult> {
    const successful: string[] = [];
    const failed: Array<{ path: string; error: unknown; operation: string }> = [];

    try {
      const updates: Record<string, unknown> = {};

      for (const operation of operations) {
        try {
          switch (operation.operation) {
            case "set":
            case "update":
              updates[operation.path] = operation.data;
              break;
            case "remove":
              updates[operation.path] = null;
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
        } catch (error) {
          failed.push({
            path: operation.path,
            error,
            operation: operation.operation || operation.type || 'unknown',
          });
        }
      }

      if (Object.keys(updates).length > 0) {
        const dbRef = ref(this.rtdb);
        await update(dbRef, updates);
        successful.push(...Object.keys(updates));
      }

      return {
        successful,
        failed,
        totalOperations: operations.length,
        successCount: successful.length,
        failureCount: failed.length,
      };
    } catch (error) {
      const allFailed = operations.map((op) => ({
        path: op.path,
        error,
        operation: op.operation,
      }));

      return {
        successful: [],
        failed: allFailed,
        totalOperations: operations.length,
        successCount: 0,
        failureCount: operations.length,
      };
    }
  }

  async multiPathUpdate(updates: Record<string, unknown>): Promise<boolean> {
    try {
      const dbRef = ref(this.rtdb);
      await update(dbRef, updates);
      return true;
    } catch (error) {
      return false;
    }
  }

  async executeTransaction(
    transaction: RealtimeTransaction
  ): Promise<TransactionResult> {
    try {
      const dbRef = ref(this.rtdb, transaction.path);
      const result: FirebaseTransactionResult = await runTransaction(
        dbRef,
        transaction.updateFunction,
        {
          applyLocally: transaction.applyLocally ?? true,
        }
      );

      return {
        committed: result.committed,
        snapshot: result.snapshot,
        value: result.snapshot?.val() || null,
      };
    } catch (error) {
      throw error;
    }
  }

  async incrementValue(path: string, incrementVal: number): Promise<number> {
    try {
      const transaction: RealtimeTransaction = {
        path,
        updateFunction: (currentValue) => {
          const currentNum =
            typeof currentValue === "number" ? currentValue : 0;
          return currentNum + incrementVal;
        },
      };

      const result = await this.executeTransaction(transaction);

      if (result.committed) {
        return result.value as number;
      } else {
        throw new Error("Transaction was not committed");
      }
    } catch (error) {
      throw error;
    }
  }

  async appendToArray(path: string, item: unknown): Promise<boolean> {
    try {
      const transaction: RealtimeTransaction = {
        path,
        updateFunction: (currentArray) => {
          const array = Array.isArray(currentArray) ? currentArray : [];
          return [...array, item];
        },
      };

      const result = await this.executeTransaction(transaction);
      return result.committed;
    } catch (error) {
      return false;
    }
  }

  async removeFromArray(path: string, index: number): Promise<boolean> {
    try {
      const transaction: RealtimeTransaction = {
        path,
        updateFunction: (currentArray) => {
          const array = Array.isArray(currentArray) ? currentArray : [];
          if (index >= 0 && index < array.length) {
            return array.filter((_, i) => i !== index);
          }
          return array;
        },
      };

      const result = await this.executeTransaction(transaction);
      return result.committed;
    } catch (error) {
      return false;
    }
  }
}
