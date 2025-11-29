// src/types/index.ts

/**
 * Archivo central de exportación de tipos
 * Importa desde aquí en lugar de archivos individuales
 */

// Media types
export type {
    MediaType,
    MediaFile,
    MediaCategory,
    ScanStatus,
    MediaFilters,
    LibraryStats,
} from './media';

// Navigation types
export type {
    RootStackParamList,
    RootStackNavigationProp,
    HomeScreenNavigationProp,
    AudioPlayerScreenNavigationProp,
    VideoPlayerScreenNavigationProp,
    VideoListScreenNavigationProp,
    DatabaseDebugScreenNavigationProp,
    AudioPlayerScreenRouteProp,
    VideoPlayerScreenRouteProp,
} from './navigation';

// Database types
export type {
    DatabaseConfig,
    SQLResultSet,
    DatabaseOperations,
    DatabaseStats,
    DatabaseLog,
    ScanOptions,
} from './database';