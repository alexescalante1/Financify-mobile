import { injectable } from 'tsyringe';
import { storage } from "../FirebaseConfiguration";
import IFirebaseStorageService, {
  UploadOptions,
  UploadResult,
  FileInfo,
  FolderInfo,
  UploadProgress,
  BatchUploadResult,
  BatchDeleteResult,
} from "@/domain/interfaces/service/IFirebaseStorageService";

import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  getBytes,
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  FullMetadata,
  SettableMetadata,
  ListResult,
} from "firebase/storage";

@injectable()
class FirebaseStorageService
  implements IFirebaseStorageService
{
  // ========================================
  // BASIC UPLOAD OPERATIONS
  // ========================================

  /**
   * Sube un archivo simple y retorna la URL de descarga
   */
  async uploadFile(
    file: File | Blob | Uint8Array,
    path: string,
    metadata?: SettableMetadata
  ): Promise<string> {
    try {
      console.log(`📤 Uploading file to: ${path}`);

      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log(`✅ File uploaded successfully: ${downloadURL}`);
      return downloadURL;
    } catch (error) {
      console.error(`❌ Error uploading file to ${path}:`, error);
      throw error;
    }
  }

  /**
   * Sube un archivo con información detallada del resultado
   */
  async uploadFileWithDetails(
    file: File | Blob | Uint8Array,
    path: string,
    metadata?: SettableMetadata
  ): Promise<UploadResult> {
    try {
      console.log(`📤 Uploading file with details to: ${path}`);

      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const fullMetadata = await getMetadata(snapshot.ref);

      const result: UploadResult = {
        downloadURL,
        fullPath: snapshot.ref.fullPath,
        name: snapshot.ref.name,
        size: fullMetadata.size,
        contentType: fullMetadata.contentType,
        metadata: fullMetadata,
      };

      console.log(`✅ File uploaded with details:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error uploading file with details to ${path}:`, error);
      throw error;
    }
  }

  /**
   * Sube un archivo con seguimiento de progreso
   */
  uploadFileWithProgress(
    file: File | Blob | Uint8Array,
    path: string,
    options?: UploadOptions
  ): UploadTask {
    console.log(`📤 Starting upload with progress tracking: ${path}`);

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(
      storageRef,
      file,
      options?.metadata
    );

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`📊 Upload progress: ${progress.toFixed(2)}%`);

        if (options?.onProgress) {
          options.onProgress(progress);
        }

        if (options?.onStateChanged) {
          options.onStateChanged(snapshot);
        }
      },
      (error) => {
        console.error(`❌ Upload error for ${path}:`, error);
        if (options?.onError) {
          options.onError(error);
        }
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(`✅ Upload completed: ${downloadURL}`);

          if (options?.onComplete) {
            options.onComplete(downloadURL);
          }
        } catch (error) {
          console.error("Error getting download URL:", error);
          if (options?.onError) {
            options.onError(error);
          }
        }
      }
    );

    return uploadTask;
  }

  /**
   * Sube múltiples archivos de forma concurrente
   */
  async uploadMultipleFiles(
    files: Array<{
      file: File | Blob | Uint8Array;
      path: string;
      metadata?: SettableMetadata;
    }>,
    onProgress?: (progress: UploadProgress, fileIndex: number) => void
  ): Promise<BatchUploadResult> {
    console.log(`📤 Starting batch upload of ${files.length} files`);

    const successful: UploadResult[] = [];
    const failed: Array<{
      file: File | Blob | Uint8Array;
      error: any;
      path: string;
    }> = [];

    const uploadPromises = files.map(async (fileData, index) => {
      try {
        const result = await this.uploadFileWithDetails(
          fileData.file,
          fileData.path,
          fileData.metadata
        );
        successful.push(result);

        if (onProgress) {
          const progress: UploadProgress = {
            bytesTransferred: result.size,
            totalBytes: result.size,
            percentage: 100,
            state: "success",
          };
          onProgress(progress, index);
        }
      } catch (error) {
        console.error(`❌ Failed to upload file ${fileData.path}:`, error);
        failed.push({
          file: fileData.file,
          error,
          path: fileData.path,
        });

        if (onProgress) {
          const progress: UploadProgress = {
            bytesTransferred: 0,
            totalBytes: 0,
            percentage: 0,
            state: "error",
          };
          onProgress(progress, index);
        }
      }
    });

    await Promise.all(uploadPromises);

    const result: BatchUploadResult = {
      successful,
      failed,
      totalFiles: files.length,
      successCount: successful.length,
      failureCount: failed.length,
    };

    console.log(`📊 Batch upload completed:`, result);
    return result;
  }

  /**
   * Sube archivos desde un string base64
   */
  async uploadFromBase64(
    base64String: string,
    path: string,
    contentType: string,
    metadata?: SettableMetadata
  ): Promise<string> {
    try {
      console.log(`📤 Uploading from base64 to: ${path}`);

      // Remover el prefijo data:image/jpeg;base64, si existe
      const base64Data = base64String.replace(/^data:[^;]+;base64,/, "");

      // Convertir base64 a Uint8Array
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const uint8Array = new Uint8Array(byteNumbers);

      const finalMetadata = {
        ...metadata,
        contentType,
      };

      return await this.uploadFile(uint8Array, path, finalMetadata);
    } catch (error) {
      console.error(`❌ Error uploading from base64 to ${path}:`, error);
      throw error;
    }
  }

  /**
   * Sube un archivo desde una URL
   */
  async uploadFromURL(
    url: string,
    path: string,
    metadata?: SettableMetadata
  ): Promise<string> {
    try {
      console.log(`📤 Uploading from URL: ${url} to: ${path}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from URL: ${response.statusText}`
        );
      }

      const blob = await response.blob();

      const finalMetadata = {
        ...metadata,
        contentType: metadata?.contentType || blob.type,
      };

      return await this.uploadFile(blob, path, finalMetadata);
    } catch (error) {
      console.error(`❌ Error uploading from URL ${url} to ${path}:`, error);
      throw error;
    }
  }

  // ========================================
  // DOWNLOAD AND ACCESS OPERATIONS
  // ========================================

  /**
   * Obtiene la URL de descarga de un archivo
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      console.log(`🔗 Download URL obtained for: ${path}`);
      return url;
    } catch (error) {
      console.error(`❌ Error getting download URL for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Descarga un archivo como Blob
   */
  async downloadFile(path: string): Promise<Blob> {
    try {
      console.log(`📥 Downloading file: ${path}`);

      const storageRef = ref(storage, path);
      const bytes = await getBytes(storageRef);
      const blob = new Blob([bytes]);

      console.log(`✅ File downloaded as blob: ${path}`);
      return blob;
    } catch (error) {
      console.error(`❌ Error downloading file ${path}:`, error);
      throw error;
    }
  }

  /**
   * Descarga un archivo como ArrayBuffer
   */
  async downloadFileAsBuffer(path: string): Promise<ArrayBuffer> {
    try {
      console.log(`📥 Downloading file as buffer: ${path}`);

      const storageRef = ref(storage, path);
      const buffer = await getBytes(storageRef);

      console.log(`✅ File downloaded as buffer: ${path}`);
      return buffer;
    } catch (error) {
      console.error(`❌ Error downloading file as buffer ${path}:`, error);
      throw error;
    }
  }

  /**
   * Descarga múltiples archivos como ZIP
   */
  async downloadMultipleFilesAsZip(
    paths: string[],
    zipName: string
  ): Promise<Blob> {
    try {
      console.log(`📥 Creating ZIP with ${paths.length} files: ${zipName}`);

      // Nota: Esta implementación requiere una librería como JSZip
      // Por ahora, retornamos un error indicando que se necesita implementar
      throw new Error("ZIP download requires JSZip library implementation");

      // Implementación con JSZip sería:
      // const JSZip = require('jszip');
      // const zip = new JSZip();
      //
      // for (const path of paths) {
      //   const fileData = await this.downloadFileAsBuffer(path);
      //   const fileName = path.split('/').pop() || 'file';
      //   zip.file(fileName, fileData);
      // }
      //
      // return await zip.generateAsync({ type: 'blob' });
    } catch (error) {
      console.error(`❌ Error creating ZIP ${zipName}:`, error);
      throw error;
    }
  }

  // ========================================
  // DELETE OPERATIONS
  // ========================================

  /**
   * Elimina un archivo específico
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting file: ${path}`);

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      console.log(`✅ File deleted successfully: ${path}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting file ${path}:`, error);
      return false;
    }
  }

  /**
   * Elimina múltiples archivos
   */
  async deleteMultipleFiles(paths: string[]): Promise<BatchDeleteResult> {
    console.log(`🗑️ Starting batch delete of ${paths.length} files`);

    const successful: string[] = [];
    const failed: Array<{ path: string; error: any }> = [];

    const deletePromises = paths.map(async (path) => {
      try {
        await this.deleteFile(path);
        successful.push(path);
      } catch (error) {
        console.error(`❌ Failed to delete file ${path}:`, error);
        failed.push({ path, error });
      }
    });

    await Promise.all(deletePromises);

    const result: BatchDeleteResult = {
      successful,
      failed,
      totalFiles: paths.length,
      successCount: successful.length,
      failureCount: failed.length,
    };

    console.log(`📊 Batch delete completed:`, result);
    return result;
  }

  /**
   * Elimina todos los archivos de una carpeta
   */
  async deleteFolder(
    folderPath: string,
    recursive: boolean = false
  ): Promise<boolean> {
    try {
      console.log(
        `🗑️ Deleting folder: ${folderPath} (recursive: ${recursive})`
      );

      const folderRef = ref(storage, folderPath);
      const listResult = await listAll(folderRef);

      // Eliminar archivos
      if (listResult.items.length > 0) {
        const deletePromises = listResult.items.map((fileRef) =>
          deleteObject(fileRef)
        );
        await Promise.all(deletePromises);
        console.log(
          `✅ Deleted ${listResult.items.length} files from ${folderPath}`
        );
      }

      // Eliminar subcarpetas si es recursivo
      if (recursive && listResult.prefixes.length > 0) {
        const deleteFolderPromises = listResult.prefixes.map((prefixRef) =>
          this.deleteFolder(prefixRef.fullPath, true)
        );
        await Promise.all(deleteFolderPromises);
        console.log(
          `✅ Deleted ${listResult.prefixes.length} subfolders from ${folderPath}`
        );
      }

      console.log(`✅ Folder deleted successfully: ${folderPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting folder ${folderPath}:`, error);
      return false;
    }
  }

  /**
   * Elimina archivos más antiguos que una fecha específica
   */
  async deleteOldFiles(folderPath: string, olderThan: Date): Promise<number> {
    try {
      console.log(
        `🗑️ Deleting old files in ${folderPath} older than ${olderThan.toISOString()}`
      );

      const files = await this.listFiles(folderPath);
      const oldFiles = files.filter(
        (file) => new Date(file.timeCreated) < olderThan
      );

      if (oldFiles.length === 0) {
        console.log(`📭 No old files found in ${folderPath}`);
        return 0;
      }

      const deletePromises = oldFiles.map((file) =>
        this.deleteFile(file.fullPath)
      );
      await Promise.all(deletePromises);

      console.log(`✅ Deleted ${oldFiles.length} old files from ${folderPath}`);
      return oldFiles.length;
    } catch (error) {
      console.error(`❌ Error deleting old files from ${folderPath}:`, error);
      return 0;
    }
  }

  // ========================================
  // METADATA OPERATIONS
  // ========================================

  /**
   * Obtiene los metadatos de un archivo
   */
  async getFileMetadata(path: string): Promise<FullMetadata> {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      console.log(`📋 Metadata obtained for: ${path}`);
      return metadata;
    } catch (error) {
      console.error(`❌ Error getting metadata for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza los metadatos de un archivo
   */
  async updateFileMetadata(
    path: string,
    metadata: SettableMetadata
  ): Promise<FullMetadata> {
    try {
      console.log(`📝 Updating metadata for: ${path}`);

      const storageRef = ref(storage, path);
      const updatedMetadata = await updateMetadata(storageRef, metadata);

      console.log(`✅ Metadata updated for: ${path}`);
      return updatedMetadata;
    } catch (error) {
      console.error(`❌ Error updating metadata for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene información completa de un archivo
   */
  async getFileInfo(
    path: string,
    includeDownloadURL: boolean = false
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

      if (includeDownloadURL) {
        try {
          fileInfo.downloadURL = await this.getDownloadURL(path);
        } catch (error) {
          console.warn(`⚠️ Could not get download URL for ${path}:`, error);
        }
      }

      return fileInfo;
    } catch (error) {
      console.error(`❌ Error getting file info for ${path}:`, error);
      throw error;
    }
  }

  // ========================================
  // LIST AND BROWSE OPERATIONS
  // ========================================

  /**
   * Lista todos los archivos en una carpeta
   */
  async listFiles(
    folderPath: string,
    includeSubfolders: boolean = false
  ): Promise<FileInfo[]> {
    try {
      console.log(`📁 Listing files in: ${folderPath}`);

      const folderRef = ref(storage, folderPath);
      const listResult = await listAll(folderRef);

      const files: FileInfo[] = [];

      // Procesar archivos en la carpeta actual
      for (const itemRef of listResult.items) {
        try {
          const fileInfo = await this.getFileInfo(itemRef.fullPath);
          files.push(fileInfo);
        } catch (error) {
          console.warn(
            `⚠️ Could not get info for file ${itemRef.fullPath}:`,
            error
          );
        }
      }

      // Procesar subcarpetas si se solicita
      if (includeSubfolders) {
        for (const prefixRef of listResult.prefixes) {
          try {
            const subfolderFiles = await this.listFiles(
              prefixRef.fullPath,
              true
            );
            files.push(...subfolderFiles);
          } catch (error) {
            console.warn(
              `⚠️ Could not list subfolder ${prefixRef.fullPath}:`,
              error
            );
          }
        }
      }

      console.log(`📊 Found ${files.length} files in ${folderPath}`);
      return files;
    } catch (error) {
      console.error(`❌ Error listing files in ${folderPath}:`, error);
      throw error;
    }
  }

  /**
   * Lista archivos con paginación
   */
  async listFilesPaginated(
    folderPath: string,
    maxResults: number = 100,
    pageToken?: string
  ): Promise<{ files: FileInfo[]; nextPageToken?: string }> {
    try {
      console.log(
        `📁 Listing files paginated in: ${folderPath} (max: ${maxResults})`
      );

      // Firebase Storage no tiene paginación nativa, implementamos una simulación
      const allFiles = await this.listFiles(folderPath);

      const startIndex = pageToken ? parseInt(pageToken, 10) : 0;
      const endIndex = Math.min(startIndex + maxResults, allFiles.length);
      const files = allFiles.slice(startIndex, endIndex);

      const nextPageToken =
        endIndex < allFiles.length ? endIndex.toString() : undefined;

      console.log(
        `📊 Paginated result: ${files.length} files, next token: ${nextPageToken}`
      );
      return { files, nextPageToken };
    } catch (error) {
      console.error(
        `❌ Error listing files paginated in ${folderPath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene información completa de una carpeta
   */
  async getFolderInfo(
    folderPath: string,
    includeDownloadURLs: boolean = false
  ): Promise<FolderInfo> {
    try {
      console.log(`📁 Getting folder info for: ${folderPath}`);

      const folderRef = ref(storage, folderPath);
      const listResult = await listAll(folderRef);

      const files: FileInfo[] = [];
      let totalSize = 0;

      // Procesar archivos
      for (const itemRef of listResult.items) {
        try {
          const fileInfo = await this.getFileInfo(
            itemRef.fullPath,
            includeDownloadURLs
          );
          files.push(fileInfo);
          totalSize += fileInfo.size;
        } catch (error) {
          console.warn(
            `⚠️ Could not get info for file ${itemRef.fullPath}:`,
            error
          );
        }
      }

      const subfolders = listResult.prefixes.map((prefix) => prefix.fullPath);

      const folderInfo: FolderInfo = {
        name: folderPath.split("/").pop() || folderPath,
        fullPath: folderPath,
        files,
        subfolders,
        totalFiles: files.length,
        totalSize,
      };

      console.log(`📊 Folder info obtained:`, folderInfo);
      return folderInfo;
    } catch (error) {
      console.error(`❌ Error getting folder info for ${folderPath}:`, error);
      throw error;
    }
  }

  /**
   * Busca archivos por nombre o patrón
   */
  async searchFiles(
    folderPath: string,
    searchPattern: string | RegExp,
    recursive: boolean = false
  ): Promise<FileInfo[]> {
    try {
      console.log(
        `🔍 Searching files in ${folderPath} with pattern:`,
        searchPattern
      );

      const allFiles = await this.listFiles(folderPath, recursive);
      const pattern =
        typeof searchPattern === "string"
          ? new RegExp(searchPattern, "i")
          : searchPattern;

      const matchingFiles = allFiles.filter((file) => pattern.test(file.name));

      console.log(`📊 Found ${matchingFiles.length} matching files`);
      return matchingFiles;
    } catch (error) {
      console.error(`❌ Error searching files in ${folderPath}:`, error);
      throw error;
    }
  }

  /**
   * Filtra archivos por tipo de contenido
   */
  async filterFilesByContentType(
    folderPath: string,
    contentTypes: string[]
  ): Promise<FileInfo[]> {
    try {
      console.log(`🔍 Filtering files by content types:`, contentTypes);

      const allFiles = await this.listFiles(folderPath);
      const filteredFiles = allFiles.filter(
        (file) => file.contentType && contentTypes.includes(file.contentType)
      );

      console.log(
        `📊 Found ${filteredFiles.length} files matching content types`
      );
      return filteredFiles;
    } catch (error) {
      console.error(
        `❌ Error filtering files by content type in ${folderPath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene el tamaño total de una carpeta
   */
  async getFolderSize(
    folderPath: string,
    recursive: boolean = false
  ): Promise<number> {
    try {
      console.log(`📏 Calculating folder size for: ${folderPath}`);

      const files = await this.listFiles(folderPath, recursive);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      console.log(
        `📊 Total folder size: ${totalSize} bytes (${(
          totalSize /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );
      return totalSize;
    } catch (error) {
      console.error(
        `❌ Error calculating folder size for ${folderPath}:`,
        error
      );
      throw error;
    }
  }

  // ========================================
  // ADVANCED OPERATIONS
  // ========================================

  /**
   * Copia un archivo a otra ubicación
   */
  async copyFile(
    sourcePath: string,
    destinationPath: string,
    metadata?: SettableMetadata
  ): Promise<boolean> {
    try {
      console.log(`📋 Copying file from ${sourcePath} to ${destinationPath}`);

      // Descargar el archivo fuente
      const fileData = await this.downloadFile(sourcePath);

      // Obtener metadatos originales y combinar con los nuevos
      const originalMetadata = await this.getFileMetadata(sourcePath);
      const finalMetadata = {
        ...originalMetadata,
        ...metadata,
      };

      // Subir a la nueva ubicación
      await this.uploadFile(fileData, destinationPath, finalMetadata);

      console.log(
        `✅ File copied successfully from ${sourcePath} to ${destinationPath}`
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Error copying file from ${sourcePath} to ${destinationPath}:`,
        error
      );
      return false;
    }
  }

  /**
   * Mueve un archivo a otra ubicación
   */
  async moveFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<boolean> {
    try {
      console.log(`🚚 Moving file from ${sourcePath} to ${destinationPath}`);

      // Copiar el archivo
      const copySuccess = await this.copyFile(sourcePath, destinationPath);

      if (copySuccess) {
        // Eliminar el archivo original
        await this.deleteFile(sourcePath);
        console.log(
          `✅ File moved successfully from ${sourcePath} to ${destinationPath}`
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        `❌ Error moving file from ${sourcePath} to ${destinationPath}:`,
        error
      );
      return false;
    }
  }

  /**
   * Renombra un archivo
   */
  async renameFile(currentPath: string, newName: string): Promise<string> {
    try {
      console.log(`✏️ Renaming file ${currentPath} to ${newName}`);

      const pathParts = currentPath.split("/");
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join("/");

      const moveSuccess = await this.moveFile(currentPath, newPath);

      if (moveSuccess) {
        console.log(`✅ File renamed successfully to ${newPath}`);
        return newPath;
      }

      throw new Error("Failed to rename file");
    } catch (error) {
      console.error(`❌ Error renaming file ${currentPath}:`, error);
      throw error;
    }
  }

  /**
   * Crea una copia de seguridad de archivos
   */
  async backupFiles(
    sourcePaths: string[],
    backupFolderPath: string
  ): Promise<BatchUploadResult> {
    try {
      console.log(
        `💾 Creating backup of ${sourcePaths.length} files to ${backupFolderPath}`
      );

      const backupFiles: Array<{
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

          backupFiles.push({
            file: fileData,
            path: backupPath,
            metadata,
          });
        } catch (error) {
          console.warn(`⚠️ Could not prepare backup for ${sourcePath}:`, error);
        }
      }

      return await this.uploadMultipleFiles(backupFiles);
    } catch (error) {
      console.error(`❌ Error creating backup:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza archivos locales con una carpeta remota
   */
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
      console.log(
        `🔄 Syncing ${localFiles.length} files to ${remoteFolderPath}`
      );

      const uploaded: UploadResult[] = [];
      const deleted: string[] = [];
      const skipped: string[] = [];

      // Obtener archivos remotos existentes
      const remoteFiles = await this.listFiles(remoteFolderPath);
      const remoteFilePaths = new Set(remoteFiles.map((f) => f.fullPath));

      // Subir archivos locales
      for (const { file, relativePath } of localFiles) {
        try {
          const remotePath = `${remoteFolderPath}/${relativePath}`;
          const result = await this.uploadFileWithDetails(file, remotePath);
          uploaded.push(result);
          remoteFilePaths.delete(remotePath);
        } catch (error) {
          console.warn(`⚠️ Could not upload ${relativePath}:`, error);
          skipped.push(relativePath);
        }
      }

      // Eliminar archivos remotos huérfanos si se solicita
      if (deleteRemoteOrphans) {
        for (const orphanPath of remoteFilePaths) {
          try {
            await this.deleteFile(orphanPath);
            deleted.push(orphanPath);
          } catch (error) {
            console.warn(`⚠️ Could not delete orphan ${orphanPath}:`, error);
          }
        }
      }

      const result = { uploaded, deleted, skipped };
      console.log(`✅ Sync completed:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error syncing files:`, error);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Verifica si un archivo existe
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      await this.getFileMetadata(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene referencia de Storage
   */
  getStorageReference(path: string): StorageReference {
    return ref(storage, path);
  }

  /**
   * Genera una ruta única basada en timestamp
   */
  generateUniquePath(
    basePath: string,
    fileName: string,
    includeUserId: boolean = false
  ): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);

    const fileExtension = fileName.split(".").pop();
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

    let uniqueName = `${nameWithoutExtension}_${timestamp}_${randomId}`;
    if (fileExtension) {
      uniqueName += `.${fileExtension}`;
    }

    if (includeUserId) {
      // Aquí podrías obtener el userId del contexto de autenticación
      // const userId = getCurrentUserId();
      const userId = "user_id"; // Placeholder
      return `${basePath}/${userId}/${uniqueName}`;
    }

    return `${basePath}/${uniqueName}`;
  }

  /**
   * Valida el tipo de archivo
   */
  validateFile(file: File, allowedTypes: string[], maxSize?: number): boolean {
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      console.warn(
        `⚠️ File type ${file.type} not allowed. Allowed types:`,
        allowedTypes
      );
      return false;
    }

    // Validar tamaño
    if (maxSize && file.size > maxSize) {
      console.warn(`⚠️ File size ${file.size} exceeds maximum ${maxSize}`);
      return false;
    }

    return true;
  }

  /**
   * Comprime una imagen antes de subirla
   */
  async compressImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspecto
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Genera thumbnails de imágenes
   */
  async generateThumbnails(
    file: File,
    sizes: Array<{ width: number; height: number; suffix: string }>,
    basePath: string
  ): Promise<Array<{ size: string; url: string }>> {
    try {
      console.log(`🖼️ Generating ${sizes.length} thumbnails for ${file.name}`);

      const thumbnails: Array<{ size: string; url: string }> = [];

      for (const size of sizes) {
        try {
          const compressedFile = await this.compressImage(
            file,
            size.width,
            size.height,
            0.8
          );
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          const extension = file.name.split(".").pop();
          const thumbnailPath = `${basePath}/${fileName}_${size.suffix}.${extension}`;

          const url = await this.uploadFile(compressedFile, thumbnailPath);
          thumbnails.push({
            size: size.suffix,
            url,
          });
        } catch (error) {
          console.warn(
            `⚠️ Could not generate thumbnail ${size.suffix}:`,
            error
          );
        }
      }

      console.log(`✅ Generated ${thumbnails.length} thumbnails`);
      return thumbnails;
    } catch (error) {
      console.error(`❌ Error generating thumbnails:`, error);
      throw error;
    }
  }

  /**
   * Limpia archivos temporales antiguos
   */
  async cleanupTempFiles(
    tempFolderPath: string,
    olderThanHours: number
  ): Promise<number> {
    try {
      console.log(
        `🧹 Cleaning up temp files older than ${olderThanHours} hours`
      );

      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

      const deletedCount = await this.deleteOldFiles(
        tempFolderPath,
        cutoffDate
      );

      console.log(`✅ Cleanup completed: ${deletedCount} temp files deleted`);
      return deletedCount;
    } catch (error) {
      console.error(`❌ Error during temp files cleanup:`, error);
      return 0;
    }
  }
}

export default FirebaseStorageService;
