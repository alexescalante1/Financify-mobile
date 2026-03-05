import { injectable } from 'tsyringe';
import AsyncStorage from '@react-native-async-storage/async-storage';

@injectable()
export class StorageService {
  private prefix: string = '';

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  private formatKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const formattedKey = this.formatKey(key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(formattedKey, serializedValue);
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const formattedKey = this.formatKey(key);
      const value = await AsyncStorage.getItem(formattedKey);

      if (value === null) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      const formattedKey = this.formatKey(key);
      await AsyncStorage.removeItem(formattedKey);
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const formattedKey = this.formatKey(key);
      const value = await AsyncStorage.getItem(formattedKey);
      return value !== null;
    } catch {
      return false;
    }
  }

  async setMultiple(items: Record<string, unknown>): Promise<boolean> {
    try {
      const pairs: Array<[string, string]> = Object.entries(items).map(([key, value]) => [
        this.formatKey(key),
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);

      await AsyncStorage.multiSet(pairs);
      return true;
    } catch {
      return false;
    }
  }

  async getMultiple<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const formattedKeys = keys.map(key => this.formatKey(key));
      const results = await AsyncStorage.multiGet(formattedKeys);

      const data: Record<string, T | null> = {};

      results.forEach(([, value], index) => {
        const originalKey = keys[index];
        if (value === null) {
          data[originalKey] = null;
        } else {
          try {
            data[originalKey] = JSON.parse(value) as T;
          } catch {
            data[originalKey] = value as unknown as T;
          }
        }
      });

      return data;
    } catch {
      return {};
    }
  }

  async removeMultiple(keys: string[]): Promise<boolean> {
    try {
      const formattedKeys = keys.map(key => this.formatKey(key));
      await AsyncStorage.multiRemove(formattedKeys);
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
      const currentObject = await this.getObject<T>(key);
      const updatedObject = { ...currentObject, ...updates } as T;
      return this.setObject(key, updatedObject);
    } catch {
      return false;
    }
  }

  async getProperty<T>(key: string, property: string): Promise<T | null> {
    try {
      const object = await this.getObject<Record<string, unknown>>(key);
      return (object?.[property] as T) ?? null;
    } catch {
      return null;
    }
  }

  async setProperty<T>(key: string, property: string, value: T): Promise<boolean> {
    return this.updateObject<Record<string, unknown>>(key, { [property]: value });
  }

  async removeProperty(key: string, property: string): Promise<boolean> {
    try {
      const object = await this.getObject<Record<string, unknown>>(key);
      if (object && property in object) {
        delete object[property];
        return this.setObject(key, object);
      }
      return false;
    } catch {
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();

      if (this.prefix) {
        return allKeys
          .filter(key => key.startsWith(`${this.prefix}_`))
          .map(key => key.replace(`${this.prefix}_`, ''));
      }

      return [...allKeys];
    } catch {
      return [];
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (this.prefix) {
        const keys = await this.getAllKeys();
        return this.removeMultiple(keys);
      } else {
        await AsyncStorage.clear();
        return true;
      }
    } catch {
      return false;
    }
  }

  async clearByPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.getAllKeys();
      const keysToRemove = keys.filter(key => key.includes(pattern));
      return this.removeMultiple(keysToRemove);
    } catch {
      return false;
    }
  }

  async getInfo(): Promise<{
    totalKeys: number;
    keys: string[];
    sizeBytes: number;
  }> {
    try {
      const keys = await this.getAllKeys();
      const data = await this.getMultiple(keys);

      let totalSize = 0;
      Object.values(data).forEach(value => {
        if (value !== null) {
          totalSize += new Blob([JSON.stringify(value)]).size;
        }
      });

      return {
        totalKeys: keys.length,
        keys,
        sizeBytes: totalSize
      };
    } catch {
      return { totalKeys: 0, keys: [], sizeBytes: 0 };
    }
  }

  async backup(): Promise<Record<string, unknown> | null> {
    try {
      const keys = await this.getAllKeys();
      return this.getMultiple(keys);
    } catch {
      return null;
    }
  }

  async restore(backup: Record<string, unknown>): Promise<boolean> {
    try {
      return this.setMultiple(backup);
    } catch {
      return false;
    }
  }
}
