import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  ref,
  getMetadata,
  updateMetadata,
  FullMetadata,
  SettableMetadata,
  FirebaseStorage,
} from "firebase/storage";
import { FileInfo } from "./StorageTypes";

@injectable()
export class StorageMetadataService {
  constructor(@inject(DI_TOKENS.StorageInstance) private readonly storage: FirebaseStorage) {}

  async getFileMetadata(path: string): Promise<FullMetadata> {
    try {
      const storageRef = ref(this.storage, path);
      const metadata = await getMetadata(storageRef);
      return metadata;
    } catch (error) {
      throw error;
    }
  }

  async updateFileMetadata(
    path: string,
    metadata: SettableMetadata
  ): Promise<FullMetadata> {
    try {
      const storageRef = ref(this.storage, path);
      const updatedMetadata = await updateMetadata(storageRef, metadata);
      return updatedMetadata;
    } catch (error) {
      throw error;
    }
  }

  async getFileInfo(
    path: string,
    includeDownloadURL: boolean = false,
    getDownloadURL?: (path: string) => Promise<string>
  ): Promise<FileInfo> {
    try {
      const metadata = await this.getFileMetadata(path);

      const fileInfo: FileInfo = {
        name: metadata.name,
        fullPath: metadata.fullPath,
        size: metadata.size,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        contentType: metadata.contentType,
        metadata,
      };

      if (includeDownloadURL && getDownloadURL) {
        try {
          fileInfo.downloadURL = await getDownloadURL(path);
        } catch (error) {
          // silent
        }
      }

      return fileInfo;
    } catch (error) {
      throw error;
    }
  }
}
