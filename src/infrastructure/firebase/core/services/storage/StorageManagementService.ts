import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  ref,
  deleteObject,
  listAll,
  getMetadata,
  getDownloadURL,
  FirebaseStorage,
  SettableMetadata,
  StorageReference,
} from "firebase/storage";
import {
  BatchDeleteResult,
  FileInfo,
  FolderInfo,
  UploadResult,
  BatchUploadResult,
} from "./StorageTypes";

@injectable()
export class StorageManagementService {
  constructor(@inject(DI_TOKENS.StorageInstance) private readonly storage: FirebaseStorage) {}

  async deleteFile(path: string): Promise<boolean> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.warn('[StorageManagement]', error);
      return false;
    }
  }

  async deleteMultipleFiles(paths: string[]): Promise<BatchDeleteResult> {
    const successful: string[] = [];
    const failed: Array<{ path: string; error: unknown }> = [];

    const deletePromises = paths.map(async (path) => {
      try {
        await this.deleteFile(path);
        successful.push(path);
      } catch (error) {
        failed.push({ path, error });
      }
    });

    await Promise.all(deletePromises);

    return {
      successful,
      failed,
      totalFiles: paths.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  }

  async deleteFolder(
    folderPath: string,
    recursive: boolean = false
  ): Promise<boolean> {
    try {
      const folderRef = ref(this.storage, folderPath);
      const listResult = await listAll(folderRef);

      if (listResult.items.length > 0) {
        const deletePromises = listResult.items.map((fileRef) =>
          deleteObject(fileRef)
        );
        await Promise.all(deletePromises);
      }

      if (recursive && listResult.prefixes.length > 0) {
        const deleteFolderPromises = listResult.prefixes.map((prefixRef) =>
          this.deleteFolder(prefixRef.fullPath, true)
        );
        await Promise.all(deleteFolderPromises);
      }

      return true;
    } catch (error) {
      console.warn('[StorageManagement]', error);
      return false;
    }
  }

  async deleteOldFiles(folderPath: string, olderThan: Date, listFiles: (path: string) => Promise<FileInfo[]>): Promise<number> {
    try {
      const files = await listFiles(folderPath);
      const oldFiles = files.filter(
        (file) => new Date(file.timeCreated || '') < olderThan
      );

      if (oldFiles.length === 0) {
        return 0;
      }

      const deletePromises = oldFiles.map((file) =>
        this.deleteFile(file.fullPath)
      );
      await Promise.all(deletePromises);

      return oldFiles.length;
    } catch (error) {
      console.warn('[StorageManagement]', error);
      return 0;
    }
  }

  async copyFile(
    sourcePath: string,
    destinationPath: string,
    downloadFile: (path: string) => Promise<Blob>,
    getFileMetadata: (path: string) => Promise<any>,
    uploadFile: (file: File | Blob | Uint8Array, path: string, metadata?: SettableMetadata) => Promise<string>,
    metadata?: SettableMetadata
  ): Promise<boolean> {
    try {
      const fileData = await downloadFile(sourcePath);
      const originalMetadata = await getFileMetadata(sourcePath);
      const finalMetadata = {
        ...originalMetadata,
        ...metadata,
      };
      await uploadFile(fileData, destinationPath, finalMetadata);
      return true;
    } catch (error) {
      console.warn('[StorageManagement]', error);
      return false;
    }
  }

  async moveFile(
    sourcePath: string,
    destinationPath: string,
    downloadFile: (path: string) => Promise<Blob>,
    getFileMetadata: (path: string) => Promise<any>,
    uploadFile: (file: File | Blob | Uint8Array, path: string, metadata?: SettableMetadata) => Promise<string>
  ): Promise<boolean> {
    try {
      const copySuccess = await this.copyFile(sourcePath, destinationPath, downloadFile, getFileMetadata, uploadFile);
      if (copySuccess) {
        await this.deleteFile(sourcePath);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[StorageManagement]', error);
      return false;
    }
  }

  async renameFile(
    currentPath: string,
    newName: string,
    downloadFile: (path: string) => Promise<Blob>,
    getFileMetadata: (path: string) => Promise<any>,
    uploadFile: (file: File | Blob | Uint8Array, path: string, metadata?: SettableMetadata) => Promise<string>
  ): Promise<string> {
    try {
      const pathParts = currentPath.split("/");
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join("/");

      const moveSuccess = await this.moveFile(currentPath, newPath, downloadFile, getFileMetadata, uploadFile);

      if (moveSuccess) {
        return newPath;
      }

      throw new Error("Failed to rename file");
    } catch (error) {
      throw error;
    }
  }

  async listFiles(
    folderPath: string,
    includeSubfolders: boolean = false,
    getFileInfo: (path: string) => Promise<FileInfo>
  ): Promise<FileInfo[]> {
    try {
      const folderRef = ref(this.storage, folderPath);
      const listResult = await listAll(folderRef);

      const files: FileInfo[] = [];

      for (const itemRef of listResult.items) {
        try {
          const fileInfo = await getFileInfo(itemRef.fullPath);
          files.push(fileInfo);
        } catch (error) {
          console.warn('[StorageManagement]', error);
        }
      }

      if (includeSubfolders) {
        for (const prefixRef of listResult.prefixes) {
          try {
            const subfolderFiles = await this.listFiles(
              prefixRef.fullPath,
              true,
              getFileInfo
            );
            files.push(...subfolderFiles);
          } catch (error) {
            console.warn('[StorageManagement]', error);
          }
        }
      }

      return files;
    } catch (error) {
      throw error;
    }
  }

  async listFilesPaginated(
    folderPath: string,
    maxResults: number = 100,
    pageToken: string | undefined,
    listFiles: (path: string) => Promise<FileInfo[]>
  ): Promise<{ files: FileInfo[]; nextPageToken?: string }> {
    try {
      const allFiles = await listFiles(folderPath);
      const startIndex = pageToken ? parseInt(pageToken, 10) : 0;
      const endIndex = Math.min(startIndex + maxResults, allFiles.length);
      const files = allFiles.slice(startIndex, endIndex);

      const nextPageToken =
        endIndex < allFiles.length ? endIndex.toString() : undefined;

      return { files, nextPageToken };
    } catch (error) {
      throw error;
    }
  }

  async getFolderInfo(
    folderPath: string,
    includeDownloadURLs: boolean = false,
    getFileInfo: (path: string, includeDownloadURL?: boolean) => Promise<FileInfo>
  ): Promise<FolderInfo> {
    try {
      const folderRef = ref(this.storage, folderPath);
      const listResult = await listAll(folderRef);

      const files: FileInfo[] = [];
      let totalSize = 0;

      for (const itemRef of listResult.items) {
        try {
          const fileInfo = await getFileInfo(
            itemRef.fullPath,
            includeDownloadURLs
          );
          files.push(fileInfo);
          totalSize += fileInfo.size;
        } catch (error) {
          console.warn('[StorageManagement]', error);
        }
      }

      const subfolders = listResult.prefixes.map((prefix) => prefix.fullPath);

      return {
        name: folderPath.split("/").pop() || folderPath,
        fullPath: folderPath,
        files,
        subfolders,
        totalFiles: files.length,
        totalSize,
      };
    } catch (error) {
      throw error;
    }
  }

  async searchFiles(
    folderPath: string,
    searchPattern: string | RegExp,
    recursive: boolean = false,
    listFiles: (path: string, includeSubfolders?: boolean) => Promise<FileInfo[]>
  ): Promise<FileInfo[]> {
    try {
      const allFiles = await listFiles(folderPath, recursive);
      const pattern =
        typeof searchPattern === "string"
          ? new RegExp(searchPattern, "i")
          : searchPattern;

      return allFiles.filter((file) => pattern.test(file.name));
    } catch (error) {
      throw error;
    }
  }

  async filterFilesByContentType(
    folderPath: string,
    contentTypes: string[],
    listFiles: (path: string) => Promise<FileInfo[]>
  ): Promise<FileInfo[]> {
    try {
      const allFiles = await listFiles(folderPath);
      return allFiles.filter(
        (file) => file.contentType && contentTypes.includes(file.contentType)
      );
    } catch (error) {
      throw error;
    }
  }

  async getFolderSize(
    folderPath: string,
    recursive: boolean = false,
    listFiles: (path: string, includeSubfolders?: boolean) => Promise<FileInfo[]>
  ): Promise<number> {
    try {
      const files = await listFiles(folderPath, recursive);
      return files.reduce((sum, file) => sum + file.size, 0);
    } catch (error) {
      throw error;
    }
  }

  async fileExists(
    path: string,
    getFileMetadata: (path: string) => Promise<any>
  ): Promise<boolean> {
    try {
      await getFileMetadata(path);
      return true;
    } catch (error) {
      console.warn('[StorageManagement]', error);
      return false;
    }
  }

  getStorageReference(path: string): StorageReference {
    return ref(this.storage, path);
  }

  generateUniquePath(
    basePath: string,
    fileName: string,
    userId?: string
  ): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);

    const fileExtension = fileName.split(".").pop();
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

    let uniqueName = `${nameWithoutExtension}_${timestamp}_${randomId}`;
    if (fileExtension) {
      uniqueName += `.${fileExtension}`;
    }

    if (userId) {
      return `${basePath}/${userId}/${uniqueName}`;
    }

    return `${basePath}/${uniqueName}`;
  }

  validateFile(file: File, allowedTypes: string[], maxSize?: number): boolean {
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    if (maxSize && file.size > maxSize) {
      return false;
    }
    return true;
  }
}
