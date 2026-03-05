import {
  UploadTaskSnapshot,
  FullMetadata,
  SettableMetadata,
} from "firebase/storage";

export interface UploadOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
  metadata?: SettableMetadata;
  onProgress?: (progress: number) => void;
  onStateChanged?: (snapshot: UploadTaskSnapshot) => void;
  onError?: (error: unknown) => void;
  onComplete?: (downloadURL: string) => void;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress?: number;
  percentage?: number;
  state?: string;
}

export interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{ file?: File | Blob | Uint8Array; path?: string; error: unknown }>;
  totalFiles?: number;
  successCount?: number;
  failureCount?: number;
}

export interface BatchDeleteResult {
  successful: string[];
  failed: Array<{ path: string; error: unknown }>;
  totalFiles?: number;
  successCount?: number;
  failureCount?: number;
}

export interface FileInfo {
  name: string;
  fullPath: string;
  size: number;
  contentType?: string;
  url?: string;
  downloadURL?: string;
  createdAt?: string;
  updatedAt?: string;
  timeCreated?: string;
  updated?: string;
  metadata?: FullMetadata;
}

export interface FolderInfo {
  name?: string;
  path?: string;
  fullPath?: string;
  files?: FileInfo[];
  subfolders?: string[];
  fileCount?: number;
  totalFiles?: number;
  totalSize: number;
}

export interface UploadResult {
  url?: string;
  downloadURL?: string;
  fullPath: string;
  name: string;
  size: number;
  contentType?: string;
  metadata?: FullMetadata;
}
