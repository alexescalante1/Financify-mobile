import { injectable } from 'tsyringe';

import {
  StorageReference,
  UploadTask,
  FullMetadata,
  SettableMetadata,
} from "firebase/storage";

// Re-export types for backward compatibility
export {
  UploadOptions,
  UploadProgress,
  BatchUploadResult,
  BatchDeleteResult,
  FileInfo,
  FolderInfo,
  UploadResult,
} from "./storage/StorageTypes";

import {
  UploadOptions,
  UploadProgress,
  BatchUploadResult,
  BatchDeleteResult,
  FileInfo,
  FolderInfo,
  UploadResult,
} from "./storage/StorageTypes";

import { StorageUploadService } from "./storage/StorageUploadService";
import { StorageDownloadService } from "./storage/StorageDownloadService";
import { StorageManagementService } from "./storage/StorageManagementService";
import { StorageMetadataService } from "./storage/StorageMetadataService";

@injectable()
class FirebaseStorageService {
  constructor(
    private readonly uploadService: StorageUploadService,
    private readonly downloadService: StorageDownloadService,
    private readonly managementService: StorageManagementService,
    private readonly metadataService: StorageMetadataService,
  ) {}

  // ========================================
  // BASIC UPLOAD OPERATIONS
  // ========================================

  async uploadFile(file: File | Blob | Uint8Array, path: string, metadata?: SettableMetadata): Promise<string> {
    return this.uploadService.uploadFile(file, path, metadata);
  }

  async uploadFileWithDetails(file: File | Blob | Uint8Array, path: string, metadata?: SettableMetadata): Promise<UploadResult> {
    return this.uploadService.uploadFileWithDetails(file, path, metadata);
  }

  uploadFileWithProgress(file: File | Blob | Uint8Array, path: string, options?: UploadOptions): UploadTask {
    return this.uploadService.uploadFileWithProgress(file, path, options);
  }

  async uploadMultipleFiles(files: Array<{ file: File | Blob | Uint8Array; path: string; metadata?: SettableMetadata }>, onProgress?: (progress: UploadProgress, fileIndex: number) => void): Promise<BatchUploadResult> {
    return this.uploadService.uploadMultipleFiles(files, onProgress);
  }

  async uploadFromBase64(base64String: string, path: string, contentType: string, metadata?: SettableMetadata): Promise<string> {
    return this.uploadService.uploadFromBase64(base64String, path, contentType, metadata);
  }

  async uploadFromURL(url: string, path: string, metadata?: SettableMetadata): Promise<string> {
    return this.uploadService.uploadFromURL(url, path, metadata);
  }

  // ========================================
  // DOWNLOAD AND ACCESS OPERATIONS
  // ========================================

  async getDownloadURL(path: string): Promise<string> {
    return this.downloadService.getDownloadURL(path);
  }

  async downloadFile(path: string): Promise<Blob> {
    return this.downloadService.downloadFile(path);
  }

  async downloadFileAsBuffer(path: string): Promise<ArrayBuffer> {
    return this.downloadService.downloadFileAsBuffer(path);
  }

  async downloadMultipleFilesAsZip(paths: string[], zipName: string): Promise<Blob> {
    return this.downloadService.downloadMultipleFilesAsZip(paths, zipName);
  }

  // ========================================
  // DELETE OPERATIONS
  // ========================================

  async deleteFile(path: string): Promise<boolean> {
    return this.managementService.deleteFile(path);
  }

  async deleteMultipleFiles(paths: string[]): Promise<BatchDeleteResult> {
    return this.managementService.deleteMultipleFiles(paths);
  }

  async deleteFolder(folderPath: string, recursive: boolean = false): Promise<boolean> {
    return this.managementService.deleteFolder(folderPath, recursive);
  }

  async deleteOldFiles(folderPath: string, olderThan: Date): Promise<number> {
    return this.managementService.deleteOldFiles(folderPath, olderThan, this.listFiles.bind(this));
  }

  // ========================================
  // METADATA OPERATIONS
  // ========================================

  async getFileMetadata(path: string): Promise<FullMetadata> {
    return this.metadataService.getFileMetadata(path);
  }

  async updateFileMetadata(path: string, metadata: SettableMetadata): Promise<FullMetadata> {
    return this.metadataService.updateFileMetadata(path, metadata);
  }

  async getFileInfo(path: string, includeDownloadURL: boolean = false): Promise<FileInfo> {
    return this.metadataService.getFileInfo(path, includeDownloadURL, this.getDownloadURL.bind(this));
  }

  // ========================================
  // LIST AND BROWSE OPERATIONS
  // ========================================

  async listFiles(folderPath: string, includeSubfolders: boolean = false): Promise<FileInfo[]> {
    return this.managementService.listFiles(folderPath, includeSubfolders, this.getFileInfo.bind(this));
  }

  async listFilesPaginated(folderPath: string, maxResults: number = 100, pageToken?: string): Promise<{ files: FileInfo[]; nextPageToken?: string }> {
    return this.managementService.listFilesPaginated(folderPath, maxResults, pageToken, this.listFiles.bind(this));
  }

  async getFolderInfo(folderPath: string, includeDownloadURLs: boolean = false): Promise<FolderInfo> {
    return this.managementService.getFolderInfo(folderPath, includeDownloadURLs, this.getFileInfo.bind(this));
  }

  async searchFiles(folderPath: string, searchPattern: string | RegExp, recursive: boolean = false): Promise<FileInfo[]> {
    return this.managementService.searchFiles(folderPath, searchPattern, recursive, this.listFiles.bind(this));
  }

  async filterFilesByContentType(folderPath: string, contentTypes: string[]): Promise<FileInfo[]> {
    return this.managementService.filterFilesByContentType(folderPath, contentTypes, this.listFiles.bind(this));
  }

  async getFolderSize(folderPath: string, recursive: boolean = false): Promise<number> {
    return this.managementService.getFolderSize(folderPath, recursive, this.listFiles.bind(this));
  }

  // ========================================
  // ADVANCED OPERATIONS
  // ========================================

  async copyFile(sourcePath: string, destinationPath: string, metadata?: SettableMetadata): Promise<boolean> {
    return this.managementService.copyFile(sourcePath, destinationPath, this.downloadFile.bind(this), this.getFileMetadata.bind(this), this.uploadFile.bind(this), metadata);
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<boolean> {
    return this.managementService.moveFile(sourcePath, destinationPath, this.downloadFile.bind(this), this.getFileMetadata.bind(this), this.uploadFile.bind(this));
  }

  async renameFile(currentPath: string, newName: string): Promise<string> {
    return this.managementService.renameFile(currentPath, newName, this.downloadFile.bind(this), this.getFileMetadata.bind(this), this.uploadFile.bind(this));
  }

  async backupFiles(sourcePaths: string[], backupFolderPath: string): Promise<BatchUploadResult> {
    try {
      const backupFilesList: Array<{
        file: File | Blob | Uint8Array;
        path: string;
        metadata?: SettableMetadata;
      }> = [];

      for (const sourcePath of sourcePaths) {
        try {
          const fileData = await this.downloadFile(sourcePath);
          const metadata = await this.getFileMetadata(sourcePath);
          const fileName = sourcePath.split("/").pop() || "file";
          const backupPath = `${backupFolderPath}/${fileName}`;

          backupFilesList.push({
            file: fileData,
            path: backupPath,
            metadata,
          });
        } catch (error) {
          console.warn('[Storage]', error);
        }
      }

      return await this.uploadMultipleFiles(backupFilesList);
    } catch (error) {
      throw error;
    }
  }

  async syncFiles(
    localFiles: Array<{ file: File; relativePath: string }>,
    remoteFolderPath: string,
    deleteRemoteOrphans: boolean = false
  ): Promise<{
    uploaded: UploadResult[];
    deleted: string[];
    skipped: string[];
  }> {
    try {
      const uploaded: UploadResult[] = [];
      const deleted: string[] = [];
      const skipped: string[] = [];

      const remoteFiles = await this.listFiles(remoteFolderPath);
      const remoteFilePaths = new Set(remoteFiles.map((f) => f.fullPath));

      for (const { file, relativePath } of localFiles) {
        try {
          const remotePath = `${remoteFolderPath}/${relativePath}`;
          const result = await this.uploadFileWithDetails(file, remotePath);
          uploaded.push(result);
          remoteFilePaths.delete(remotePath);
        } catch (error) {
          skipped.push(relativePath);
        }
      }

      if (deleteRemoteOrphans) {
        for (const orphanPath of remoteFilePaths) {
          try {
            await this.deleteFile(orphanPath);
            deleted.push(orphanPath);
          } catch (error) {
            console.warn('[Storage]', error);
          }
        }
      }

      return { uploaded, deleted, skipped };
    } catch (error) {
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async fileExists(path: string): Promise<boolean> {
    return this.managementService.fileExists(path, this.getFileMetadata.bind(this));
  }

  getStorageReference(path: string): StorageReference {
    return this.managementService.getStorageReference(path);
  }

  generateUniquePath(basePath: string, fileName: string, userId?: string): string {
    return this.managementService.generateUniquePath(basePath, fileName, userId);
  }

  validateFile(file: File, allowedTypes: string[], maxSize?: number): boolean {
    return this.managementService.validateFile(file, allowedTypes, maxSize);
  }

  async compressImage(_uri: string, _quality?: number, _maxWidth?: number): Promise<string> {
    throw new Error(
      'compressImage requires expo-image-manipulator. Use ImageManipulator.manipulateAsync() instead.'
    );
  }

  async generateThumbnails(
    _fileUri: string,
    _sizes: Array<{ width: number; height: number; suffix: string }>,
    _basePath: string
  ): Promise<Array<{ size: string; url: string }>> {
    throw new Error(
      'generateThumbnails requires expo-image-manipulator. Implement using ImageManipulator.manipulateAsync() instead.'
    );
  }

  async cleanupTempFiles(tempFolderPath: string, olderThanHours: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);
      return await this.deleteOldFiles(tempFolderPath, cutoffDate);
    } catch (error) {
      console.warn('[Storage]', error);
      return 0;
    }
  }
}

export default FirebaseStorageService;
