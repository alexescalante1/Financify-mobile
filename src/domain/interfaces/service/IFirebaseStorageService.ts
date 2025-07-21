import {
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  FullMetadata,
  SettableMetadata,
  ListResult,
} from "firebase/storage";

// ========================================
// INTERFACES FOR OPTIONS AND CONFIGURATIONS
// ========================================

interface UploadOptions {
  metadata?: SettableMetadata;
  onProgress?: (progress: number) => void;
  onStateChanged?: (snapshot: UploadTaskSnapshot) => void;
  onError?: (error: any) => void;
  onComplete?: (downloadURL: string) => void;
}

interface UploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
  size: number;
  contentType?: string;
  metadata: FullMetadata;
}

interface FileInfo {
  name: string;
  fullPath: string;
  size: number;
  timeCreated: string;
  updated: string;
  contentType?: string;
  downloadURL?: string;
  metadata: FullMetadata;
}

interface FolderInfo {
  name: string;
  fullPath: string;
  files: FileInfo[];
  subfolders: string[];
  totalFiles: number;
  totalSize: number;
}

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{ file: File | Blob | Uint8Array; error: any; path: string }>;
  totalFiles: number;
  successCount: number;
  failureCount: number;
}

interface BatchDeleteResult {
  successful: string[];
  failed: Array<{ path: string; error: any }>;
  totalFiles: number;
  successCount: number;
  failureCount: number;
}

// ========================================
// MAIN INTERFACE
// ========================================

interface IFirebaseStorageService {
  // ========================================
  // BASIC UPLOAD OPERATIONS
  // ========================================

  /**
   * Sube un archivo simple y retorna la URL de descarga
   * @param file - Archivo a subir (File, Blob, o Uint8Array)
   * @param path - Ruta donde guardar el archivo
   * @param metadata - Metadatos opcionales del archivo
   * @returns Promise con la URL de descarga
   */
  uploadFile(
    file: File | Blob | Uint8Array,
    path: string,
    metadata?: SettableMetadata
  ): Promise<string>;

  /**
   * Sube un archivo con información detallada del resultado
   * @param file - Archivo a subir
   * @param path - Ruta donde guardar el archivo
   * @param metadata - Metadatos opcionales del archivo
   * @returns Promise con información completa del upload
   */
  uploadFileWithDetails(
    file: File | Blob | Uint8Array,
    path: string,
    metadata?: SettableMetadata
  ): Promise<UploadResult>;

  /**
   * Sube un archivo con seguimiento de progreso
   * @param file - Archivo a subir
   * @param path - Ruta donde guardar el archivo
   * @param options - Opciones de upload incluyendo callbacks
   * @returns UploadTask para control del proceso
   */
  uploadFileWithProgress(
    file: File | Blob | Uint8Array,
    path: string,
    options?: UploadOptions
  ): UploadTask;

  /**
   * Sube múltiples archivos de forma concurrente
   * @param files - Array de archivos con sus rutas
   * @param onProgress - Callback opcional para progreso general
   * @returns Promise con resultado del batch upload
   */
  uploadMultipleFiles(
    files: Array<{ file: File | Blob | Uint8Array; path: string; metadata?: SettableMetadata }>,
    onProgress?: (progress: UploadProgress, fileIndex: number) => void
  ): Promise<BatchUploadResult>;

  /**
   * Sube archivos desde un string base64
   * @param base64String - String en base64
   * @param path - Ruta donde guardar
   * @param contentType - Tipo de contenido del archivo
   * @param metadata - Metadatos opcionales
   * @returns Promise con la URL de descarga
   */
  uploadFromBase64(
    base64String: string,
    path: string,
    contentType: string,
    metadata?: SettableMetadata
  ): Promise<string>;

  /**
   * Sube un archivo desde una URL
   * @param url - URL del archivo a descargar y subir
   * @param path - Ruta donde guardar
   * @param metadata - Metadatos opcionales
   * @returns Promise con la URL de descarga
   */
  uploadFromURL(
    url: string,
    path: string,
    metadata?: SettableMetadata
  ): Promise<string>;

  // ========================================
  // DOWNLOAD AND ACCESS OPERATIONS
  // ========================================

  /**
   * Obtiene la URL de descarga de un archivo
   * @param path - Ruta del archivo
   * @returns Promise con la URL de descarga
   */
  getDownloadURL(path: string): Promise<string>;

  /**
   * Descarga un archivo como Blob
   * @param path - Ruta del archivo
   * @returns Promise con el Blob del archivo
   */
  downloadFile(path: string): Promise<Blob>;

  /**
   * Descarga un archivo como ArrayBuffer
   * @param path - Ruta del archivo
   * @returns Promise con el ArrayBuffer del archivo
   */
  downloadFileAsBuffer(path: string): Promise<ArrayBuffer>;

  /**
   * Descarga múltiples archivos como ZIP (requiere implementación adicional)
   * @param paths - Array de rutas de archivos
   * @param zipName - Nombre del archivo ZIP
   * @returns Promise con el Blob del ZIP
   */
  downloadMultipleFilesAsZip(paths: string[], zipName: string): Promise<Blob>;

  // ========================================
  // DELETE OPERATIONS
  // ========================================

  /**
   * Elimina un archivo específico
   * @param path - Ruta del archivo a eliminar
   * @returns Promise con boolean de éxito
   */
  deleteFile(path: string): Promise<boolean>;

  /**
   * Elimina múltiples archivos
   * @param paths - Array de rutas de archivos a eliminar
   * @returns Promise con resultado del batch delete
   */
  deleteMultipleFiles(paths: string[]): Promise<BatchDeleteResult>;

  /**
   * Elimina todos los archivos de una carpeta
   * @param folderPath - Ruta de la carpeta
   * @param recursive - Si debe eliminar subcarpetas recursivamente
   * @returns Promise con boolean de éxito
   */
  deleteFolder(folderPath: string, recursive?: boolean): Promise<boolean>;

  /**
   * Elimina archivos más antiguos que una fecha específica
   * @param folderPath - Ruta de la carpeta
   * @param olderThan - Fecha límite
   * @returns Promise con número de archivos eliminados
   */
  deleteOldFiles(folderPath: string, olderThan: Date): Promise<number>;

  // ========================================
  // METADATA OPERATIONS
  // ========================================

  /**
   * Obtiene los metadatos de un archivo
   * @param path - Ruta del archivo
   * @returns Promise con los metadatos completos
   */
  getFileMetadata(path: string): Promise<FullMetadata>;

  /**
   * Actualiza los metadatos de un archivo
   * @param path - Ruta del archivo
   * @param metadata - Nuevos metadatos
   * @returns Promise con los metadatos actualizados
   */
  updateFileMetadata(path: string, metadata: SettableMetadata): Promise<FullMetadata>;

  /**
   * Obtiene información completa de un archivo
   * @param path - Ruta del archivo
   * @param includeDownloadURL - Si incluir la URL de descarga
   * @returns Promise con información completa del archivo
   */
  getFileInfo(path: string, includeDownloadURL?: boolean): Promise<FileInfo>;

  // ========================================
  // LIST AND BROWSE OPERATIONS
  // ========================================

  /**
   * Lista todos los archivos en una carpeta
   * @param folderPath - Ruta de la carpeta
   * @param includeSubfolders - Si incluir subcarpetas
   * @returns Promise con la lista de archivos
   */
  listFiles(folderPath: string, includeSubfolders?: boolean): Promise<FileInfo[]>;

  /**
   * Lista archivos con paginación
   * @param folderPath - Ruta de la carpeta
   * @param maxResults - Número máximo de resultados
   * @param pageToken - Token para la siguiente página
   * @returns Promise con resultado paginado
   */
  listFilesPaginated(
    folderPath: string,
    maxResults?: number,
    pageToken?: string
  ): Promise<{ files: FileInfo[]; nextPageToken?: string }>;

  /**
   * Obtiene información completa de una carpeta
   * @param folderPath - Ruta de la carpeta
   * @param includeDownloadURLs - Si incluir URLs de descarga
   * @returns Promise con información completa de la carpeta
   */
  getFolderInfo(folderPath: string, includeDownloadURLs?: boolean): Promise<FolderInfo>;

  /**
   * Busca archivos por nombre o patrón
   * @param folderPath - Ruta de la carpeta donde buscar
   * @param searchPattern - Patrón de búsqueda (regex o string)
   * @param recursive - Si buscar en subcarpetas
   * @returns Promise con archivos encontrados
   */
  searchFiles(
    folderPath: string,
    searchPattern: string | RegExp,
    recursive?: boolean
  ): Promise<FileInfo[]>;

  /**
   * Filtra archivos por tipo de contenido
   * @param folderPath - Ruta de la carpeta
   * @param contentTypes - Tipos de contenido a filtrar
   * @returns Promise con archivos filtrados
   */
  filterFilesByContentType(
    folderPath: string,
    contentTypes: string[]
  ): Promise<FileInfo[]>;

  /**
   * Obtiene el tamaño total de una carpeta
   * @param folderPath - Ruta de la carpeta
   * @param recursive - Si incluir subcarpetas
   * @returns Promise con el tamaño total en bytes
   */
  getFolderSize(folderPath: string, recursive?: boolean): Promise<number>;

  // ========================================
  // ADVANCED OPERATIONS
  // ========================================

  /**
   * Copia un archivo a otra ubicación
   * @param sourcePath - Ruta del archivo origen
   * @param destinationPath - Ruta de destino
   * @param metadata - Metadatos opcionales para el archivo copiado
   * @returns Promise con boolean de éxito
   */
  copyFile(
    sourcePath: string,
    destinationPath: string,
    metadata?: SettableMetadata
  ): Promise<boolean>;

  /**
   * Mueve un archivo a otra ubicación
   * @param sourcePath - Ruta del archivo origen
   * @param destinationPath - Ruta de destino
   * @returns Promise con boolean de éxito
   */
  moveFile(sourcePath: string, destinationPath: string): Promise<boolean>;

  /**
   * Renombra un archivo
   * @param currentPath - Ruta actual del archivo
   * @param newName - Nuevo nombre del archivo
   * @returns Promise con la nueva ruta
   */
  renameFile(currentPath: string, newName: string): Promise<string>;

  /**
   * Crea una copia de seguridad de archivos
   * @param sourcePaths - Rutas de archivos a respaldar
   * @param backupFolderPath - Carpeta de destino para el backup
   * @returns Promise con resultado del backup
   */
  backupFiles(sourcePaths: string[], backupFolderPath: string): Promise<BatchUploadResult>;

  /**
   * Sincroniza archivos locales con una carpeta remota
   * @param localFiles - Archivos locales
   * @param remoteFolderPath - Carpeta remota
   * @param deleteRemoteOrphans - Si eliminar archivos remotos que no existen localmente
   * @returns Promise con resultado de la sincronización
   */
  syncFiles(
    localFiles: Array<{ file: File; relativePath: string }>,
    remoteFolderPath: string,
    deleteRemoteOrphans?: boolean
  ): Promise<{
    uploaded: UploadResult[];
    deleted: string[];
    skipped: string[];
  }>;

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Verifica si un archivo existe
   * @param path - Ruta del archivo
   * @returns Promise con boolean indicando si existe
   */
  fileExists(path: string): Promise<boolean>;

  /**
   * Obtiene referencia de Storage
   * @param path - Ruta del archivo/carpeta
   * @returns StorageReference
   */
  getStorageReference(path: string): StorageReference;

  /**
   * Genera una ruta única basada en timestamp
   * @param basePath - Ruta base
   * @param fileName - Nombre del archivo
   * @param includeUserId - Si incluir ID de usuario
   * @returns String con ruta única
   */
  generateUniquePath(basePath: string, fileName: string, includeUserId?: boolean): string;

  /**
   * Valida el tipo de archivo
   * @param file - Archivo a validar
   * @param allowedTypes - Tipos permitidos
   * @param maxSize - Tamaño máximo en bytes
   * @returns boolean indicando si es válido
   */
  validateFile(file: File, allowedTypes: string[], maxSize?: number): boolean;

  /**
   * Comprime una imagen antes de subirla
   * @param file - Archivo de imagen
   * @param maxWidth - Ancho máximo
   * @param maxHeight - Alto máximo
   * @param quality - Calidad de compresión (0-1)
   * @returns Promise con archivo comprimido
   */
  compressImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality?: number
  ): Promise<File>;

  /**
   * Genera thumbnails de imágenes
   * @param file - Archivo de imagen
   * @param sizes - Tamaños de thumbnails a generar
   * @param basePath - Ruta base donde guardar
   * @returns Promise con URLs de thumbnails generados
   */
  generateThumbnails(
    file: File,
    sizes: Array<{ width: number; height: number; suffix: string }>,
    basePath: string
  ): Promise<Array<{ size: string; url: string }>>;

  /**
   * Limpia archivos temporales antiguos
   * @param tempFolderPath - Ruta de carpeta temporal
   * @param olderThanHours - Archivos más antiguos que X horas
   * @returns Promise con número de archivos eliminados
   */
  cleanupTempFiles(tempFolderPath: string, olderThanHours: number): Promise<number>;
}

// ========================================
// EXPORT INTERFACES
// ========================================

export default IFirebaseStorageService;

export type {
  UploadOptions,
  UploadResult,
  FileInfo,
  FolderInfo,
  UploadProgress,
  BatchUploadResult,
  BatchDeleteResult,
};