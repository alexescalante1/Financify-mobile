import { injectable } from 'tsyringe';
import * as SQLite from 'expo-sqlite';

interface StorageRecord {
  key: string;
  value: string;
  type: 'string' | 'object' | 'number' | 'boolean';
  created_at: string;
  updated_at: string;
}

@injectable()
export class SQLiteStorageService {
  private db: SQLite.SQLiteDatabase | null = null;
  private prefix: string = '';
  private isInitialized = false;

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  private formatKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    this.db = await SQLite.openDatabaseAsync('finanzas_storage.db');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'string',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_storage_key ON storage(key);

      CREATE TRIGGER IF NOT EXISTS update_timestamp
      AFTER UPDATE ON storage
      FOR EACH ROW
      BEGIN
        UPDATE storage SET updated_at = datetime('now') WHERE key = NEW.key;
      END;
    `);

    this.isInitialized = true;
  }

  private async ensureInit(): Promise<void> {
    if (!this.isInitialized) await this.init();
  }

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await this.ensureInit();
      const formattedKey = this.formatKey(key);

      let serializedValue: string;
      let type: StorageRecord['type'];

      if (typeof value === 'string') {
        serializedValue = value;
        type = 'string';
      } else if (typeof value === 'number') {
        serializedValue = value.toString();
        type = 'number';
      } else if (typeof value === 'boolean') {
        serializedValue = value.toString();
        type = 'boolean';
      } else {
        serializedValue = JSON.stringify(value);
        type = 'object';
      }

      await this.db!.runAsync(
        `INSERT OR REPLACE INTO storage (key, value, type, updated_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [formattedKey, serializedValue, type]
      );

      return true;
    } catch {
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureInit();
      const formattedKey = this.formatKey(key);

      const result = await this.db!.getFirstAsync<StorageRecord>(
        'SELECT value, type FROM storage WHERE key = ?',
        [formattedKey]
      );

      if (!result) return null;

      const { value, type } = result;

      switch (type) {
        case 'string': return value as unknown as T;
        case 'number': return Number(value) as unknown as T;
        case 'boolean': return (value === 'true') as unknown as T;
        case 'object':
        default:
          try {
            return JSON.parse(value) as T;
          } catch {
            return value as unknown as T;
          }
      }
    } catch {
      return null;
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      await this.ensureInit();
      await this.db!.runAsync('DELETE FROM storage WHERE key = ?', [this.formatKey(key)]);
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureInit();
      const result = await this.db!.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM storage WHERE key = ?',
        [this.formatKey(key)]
      );
      return (result?.count ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async setMultiple(items: Record<string, unknown>): Promise<boolean> {
    try {
      await this.ensureInit();

      for (const [key, value] of Object.entries(items)) {
        const success = await this.set(key, value);
        if (!success) {
          throw new Error(`Failed to save key ${key}`);
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async getMultiple<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    for (const key of keys) {
      result[key] = await this.get<T>(key);
    }
    return result;
  }

  async removeMultiple(keys: string[]): Promise<boolean> {
    try {
      await this.ensureInit();

      for (const key of keys) {
        const success = await this.remove(key);
        if (!success) {
          throw new Error(`Failed to remove key ${key}`);
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async getObject<T extends object>(key: string): Promise<T | null> {
    return this.get<T>(key);
  }

  async setObject<T extends object>(key: string, object: T): Promise<boolean> {
    return this.set(key, object);
  }

  async updateObject<T extends object>(
    key: string,
    updates: Partial<T>
  ): Promise<boolean> {
    try {
      const current = await this.getObject<T>(key);
      const updated = { ...current, ...updates } as T;
      return this.setObject(key, updated);
    } catch {
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      await this.ensureInit();

      if (this.prefix) {
        await this.db!.runAsync('DELETE FROM storage WHERE key LIKE ?', [`${this.prefix}_%`]);
      } else {
        await this.db!.runAsync('DELETE FROM storage');
      }

      return true;
    } catch {
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      await this.ensureInit();

      let query = 'SELECT key FROM storage';
      const params: string[] = [];

      if (this.prefix) {
        query += ' WHERE key LIKE ?';
        params.push(`${this.prefix}_%`);
      }

      const results = await this.db!.getAllAsync<{ key: string }>(query, params);

      return results.map(row =>
        this.prefix ? row.key.replace(`${this.prefix}_`, '') : row.key
      );
    } catch {
      return [];
    }
  }
}
