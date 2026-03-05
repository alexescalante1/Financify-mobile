import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  ref,
  get,
  set,
  update,
  remove,
  child,
  push,
  DatabaseReference,
  DataSnapshot,
  Database,
} from "firebase/database";
import { RealtimeQueryOptions } from "./RealtimeTypes";
import { buildRealtimeQuery } from "./realtimeQueryBuilder";
import { mapRealtimeError } from "../../errors/RealtimeException";

@injectable()
export class RealtimeCrudService {
  constructor(@inject(DI_TOKENS.RealtimeDbInstance) private readonly rtdb: Database) {}

  async getDataByPath(path: string): Promise<unknown> {
    try {
      const dbRef = ref(this.rtdb);
      const snapshot = await get(child(dbRef, path));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      throw mapRealtimeError(error);
    }
  }

  async getDataWithQuery(
    path: string,
    options: RealtimeQueryOptions
  ): Promise<unknown> {
    try {
      const baseRef = ref(this.rtdb, path);
      const queryRef = buildRealtimeQuery(baseRef, options);
      const snapshot = await get(queryRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      throw mapRealtimeError(error);
    }
  }

  async setDataByPath(path: string, data: unknown): Promise<boolean> {
    try {
      const dbRef = ref(this.rtdb, path);
      await set(dbRef, data);
      return true;
    } catch (error) {
      console.warn('[RealtimeCrud] setDataByPath failed:', error);
      return false;
    }
  }

  async updateDataByPath(path: string, data: Record<string, unknown>): Promise<boolean> {
    try {
      const dbRef = ref(this.rtdb, path);
      await update(dbRef, data);
      return true;
    } catch (error) {
      console.warn('[RealtimeCrud] updateDataByPath failed:', error);
      return false;
    }
  }

  async deleteDataByPath(path: string): Promise<boolean> {
    try {
      const dbRef = ref(this.rtdb, path);
      await remove(dbRef);
      return true;
    } catch (error) {
      console.warn('[RealtimeCrud] deleteDataByPath failed:', error);
      return false;
    }
  }

  async pushData(path: string, data: unknown): Promise<string | null> {
    try {
      const dbRef = ref(this.rtdb, path);
      const newRef = push(dbRef, data);
      return newRef.key;
    } catch (error) {
      console.warn('[RealtimeCrud] pushData failed:', error);
      return null;
    }
  }

  async pathExists(path: string): Promise<boolean> {
    try {
      const data = await this.getDataByPath(path);
      return data !== null;
    } catch (error) {
      console.warn('[RealtimeCrud] pathExists failed:', error);
      return false;
    }
  }

  getDatabaseReference(path?: string): DatabaseReference {
    return path ? ref(this.rtdb, path) : ref(this.rtdb);
  }

  generatePushKey(path: string): string {
    const dbRef = ref(this.rtdb, path);
    const newRef = push(dbRef);
    return newRef.key!;
  }

  validatePath(path: string): boolean {
    const invalidChars = /[.#$\[\]]/;
    if (invalidChars.test(path)) {
      return false;
    }
    if (path.startsWith("/") || path.endsWith("/")) {
      return false;
    }
    if (path.includes("//")) {
      return false;
    }
    return true;
  }

  snapshotToObject(snapshot: DataSnapshot): unknown {
    if (!snapshot.exists()) {
      return null;
    }
    const data = snapshot.val();
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return { ...data };
    }
    return data;
  }

  snapshotToArray(snapshot: DataSnapshot, includeKeys: boolean = false): unknown[] {
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

  validateData(data: unknown, schema?: unknown): boolean {
    try {
      if (data === undefined) {
        return false;
      }
      if (typeof data === "object" && data !== null) {
        const invalidKeyPattern = /[.#$\[\]]/;
        const checkKeys = (obj: Record<string, unknown>): boolean => {
          for (const key in obj) {
            if (invalidKeyPattern.test(key)) {
              return false;
            }
            if (typeof obj[key] === "object" && obj[key] !== null) {
              if (!checkKeys(obj[key] as Record<string, unknown>)) {
                return false;
              }
            }
          }
          return true;
        };
        if (!checkKeys(data as Record<string, unknown>)) {
          return false;
        }
      }
      if (schema) {
        // Implementar validacion de schema segun necesidades
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  sanitizeData(data: unknown): unknown {
    try {
      if (data === null || data === undefined) {
        return data;
      }
      if (typeof data === "string") {
        return data.replace(/[<>]/g, "");
      }
      if (typeof data === "object") {
        const record = data as Record<string, unknown>;
        const sanitized: Record<string, unknown> = Array.isArray(data) ? [] as unknown as Record<string, unknown> : {};
        for (const key in record) {
          const sanitizedKey = key.replace(/[.#$\[\]]/g, "_");
          sanitized[sanitizedKey] = this.sanitizeData(record[key]);
        }
        return sanitized;
      }
      return data;
    } catch (error) {
      return data;
    }
  }

  async getSecurityInfo(path: string): Promise<{ readable: boolean; writable: boolean }> {
    try {
      let readable = false;
      try {
        await this.getDataByPath(path);
        readable = true;
      } catch (error) {
        readable = false;
      }

      let writable = false;
      try {
        const testPath = `${path}/.security_test`;
        await this.setDataByPath(testPath, true);
        await this.deleteDataByPath(testPath);
        writable = true;
      } catch (error) {
        writable = false;
      }

      return { readable, writable };
    } catch (error) {
      return { readable: false, writable: false };
    }
  }
}
