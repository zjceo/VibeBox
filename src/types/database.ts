// src/types/database.ts
import type { MediaFile } from './media';

/**
 * Configuración de la base de datos
 */
export interface DatabaseConfig {
    name: string;
    version: number;
    location: string;
}

/**
 * Resultado de una query SQL
 */
export interface SQLResultSet {
    rows: {
        length: number;
        item: (index: number) => any;
        raw: () => any[];
    };
    rowsAffected: number;
    insertId?: number;
}

/**
 * Operaciones de la base de datos
 */
export interface DatabaseOperations {
    initDatabase: () => Promise<void>;
    saveMediaFiles: (files: MediaFile[]) => Promise<void>;
    getMediaFiles: () => Promise<MediaFile[]>;
    deleteMediaFile: (id: string) => Promise<void>;
    clearAllMedia: () => Promise<void>;
    getStats: () => Promise<DatabaseStats>;
}

/**
 * Estadísticas de la base de datos
 */
export interface DatabaseStats {
    totalRecords: number;
    audioCount: number;
    videoCount: number;
    databaseSize: number;
    lastUpdate: number;
    version: number;
}

/**
 * Log de operaciones de la base de datos
 */
export interface DatabaseLog {
    id: string;
    timestamp: number;
    operation: 'insert' | 'update' | 'delete' | 'select' | 'scan';
    details: string;
    duration?: number;
    success: boolean;
    error?: string;
}

/**
 * Opciones de escaneo
 */
export interface ScanOptions {
    paths: string[];
    includeAudio: boolean;
    includeVideo: boolean;
    recursive: boolean;
    onProgress?: (progress: number) => void;
}