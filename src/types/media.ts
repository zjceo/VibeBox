/**
 * Tipo de archivo multimedia
 */
export type MediaType = 'audio' | 'video';

/**
 * Información de un archivo multimedia
 */
export interface MediaFile {
    id: string;
    filename: string;
    name?: string;           // Alias para filename (compatibilidad)
    title?: string;          // Alias para filename (compatibilidad)
    path: string;
    type: MediaType;
    extension?: string;      // Extensión del archivo (.mp3, .mp4, etc)
    duration?: number;
    size: number;
    dateAdded: number;
    lastModified: number;
    artist?: string;
    album?: string;
    artwork?: string;
    thumbnail?: string;
}

/**
 * Categoría de medios (para tabs)
 */
export type MediaCategory = 'all' | 'audio' | 'video';

/**
 * Estado de escaneo de medios
 */
export interface ScanStatus {
    isScanning: boolean;
    progress: number;
    totalFiles: number;
    scannedFiles: number;
    message?: string;
}

/**
 * Filtros de búsqueda
 */
export interface MediaFilters {
    query: string;
    type?: MediaType;
    sortBy?: 'name' | 'date' | 'size' | 'duration';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Estadísticas de la biblioteca
 */
export interface LibraryStats {
    totalFiles: number;
    audioFiles: number;
    videoFiles: number;
    totalSize: number;
    totalDuration: number;
    lastScanDate?: number;
}