import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  getDownloadURL,
  ref,
  getBytes,
  FirebaseStorage,
} from "firebase/storage";

@injectable()
export class StorageDownloadService {
  constructor(@inject(DI_TOKENS.StorageInstance) private readonly storage: FirebaseStorage) {}

  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    try {
      const storageRef = ref(this.storage, path);
      const bytes = await getBytes(storageRef);
      const blob = new Blob([bytes]);
      return blob;
    } catch (error) {
      throw error;
    }
  }

  async downloadFileAsBuffer(path: string): Promise<ArrayBuffer> {
    try {
      const storageRef = ref(this.storage, path);
      const buffer = await getBytes(storageRef);
      return buffer;
    } catch (error) {
      throw error;
    }
  }

  async downloadMultipleFilesAsZip(
    paths: string[],
    zipName: string
  ): Promise<Blob> {
    try {
      throw new Error("ZIP download requires JSZip library implementation");
    } catch (error) {
      throw error;
    }
  }
}
