import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getMetadata,
  UploadTask,
  UploadTaskSnapshot,
  SettableMetadata,
  FirebaseStorage,
} from "firebase/storage";
import {
  UploadOptions,
  UploadProgress,
  UploadResult,
  BatchUploadResult,
} from "./StorageTypes";

@injectable()
export class StorageUploadService {
  constructor(@inject(DI_TOKENS.StorageInstance) private readonly storage: FirebaseStorage) {}

  async uploadFile(
    file: File | Blob | Uint8Array,
    path: string,
    metadata?: SettableMetadata
  ): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw error;
    }
  }

  async uploadFileWithDetails(
    file: File | Blob | Uint8Array,
    path: string,
    metadata?: SettableMetadata
  ): Promise<UploadResult> {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const fullMetadata = await getMetadata(snapshot.ref);

      return {
        downloadURL,
        fullPath: snapshot.ref.fullPath,
        name: snapshot.ref.name,
        size: fullMetadata.size,
        contentType: fullMetadata.contentType,
        metadata: fullMetadata,
      };
    } catch (error) {
      throw error;
    }
  }

  uploadFileWithProgress(
    file: File | Blob | Uint8Array,
    path: string,
    options?: UploadOptions
  ): UploadTask {
    const storageRef = ref(this.storage, path);
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

        if (options?.onProgress) {
          options.onProgress(progress);
        }

        if (options?.onStateChanged) {
          options.onStateChanged(snapshot);
        }
      },
      (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (options?.onComplete) {
            options.onComplete(downloadURL);
          }
        } catch (error) {
          if (options?.onError) {
            options.onError(error);
          }
        }
      }
    );

    return uploadTask;
  }

  async uploadMultipleFiles(
    files: Array<{
      file: File | Blob | Uint8Array;
      path: string;
      metadata?: SettableMetadata;
    }>,
    onProgress?: (progress: UploadProgress, fileIndex: number) => void
  ): Promise<BatchUploadResult> {
    const successful: UploadResult[] = [];
    const failed: Array<{
      file: File | Blob | Uint8Array;
      error: unknown;
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
          onProgress({
            bytesTransferred: result.size,
            totalBytes: result.size,
            percentage: 100,
            state: "success",
          }, index);
        }
      } catch (error) {
        failed.push({
          file: fileData.file,
          error,
          path: fileData.path,
        });

        if (onProgress) {
          onProgress({
            bytesTransferred: 0,
            totalBytes: 0,
            percentage: 0,
            state: "error",
          }, index);
        }
      }
    });

    await Promise.all(uploadPromises);

    return {
      successful,
      failed,
      totalFiles: files.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  }

  async uploadFromBase64(
    base64String: string,
    path: string,
    contentType: string,
    metadata?: SettableMetadata
  ): Promise<string> {
    try {
      const base64Data = base64String.replace(/^data:[^;]+;base64,/, "");
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
      throw error;
    }
  }

  async uploadFromURL(
    url: string,
    path: string,
    metadata?: SettableMetadata
  ): Promise<string> {
    try {
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
      throw error;
    }
  }
}
