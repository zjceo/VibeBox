// ==================== TYPES ====================
export interface ColorPalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  backgroundLight: string;
  backgroundDark: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  overlay: string;
  overlayDark: string;
  overlayLight: string;
  controlActive: string;
  controlInactive: string;
}

export interface SizeConfig {
  padding: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  font: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  icon: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  button: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface StoragePaths {
  android: {
    music: string;
    downloads: string;
    movies: string;
    dcim: string;
    videos: string;
    podcasts: string;
  };
  ios: {
    documents: string;
    library: string;
  };
}

export type RepeatMode = 'off' | 'track' | 'playlist';
export type Quality = 'low' | 'medium' | 'high' | 'auto';
export type PlayerCapability = 'play' | 'pause' | 'skipToNext' | 'skipToPrevious' | 'seekTo' | 'setRating';

export interface PlayerConfig {
  progressUpdateInterval: number;
  controlsHideDelay: number;
  seekInterval: number;
  quality: {
    low: Quality;
    medium: Quality;
    high: Quality;
    auto: Quality;
  };
  repeatMode: {
    off: RepeatMode;
    track: RepeatMode;
    playlist: RepeatMode;
  };
  capabilities: PlayerCapability[];
}

export interface Messages {
  error: {
    permission: string;
    loadMedia: string;
    playback: string;
    fileNotFound: string;
    unsupportedFormat: string;
    networkError: string;
  };
  success: {
    mediaLoaded: string;
    playbackStarted: string;
  };
  info: {
    noFiles: string;
    scanning: string;
    loading: string;
    processing: string;
  };
  permissions: {
    title: string;
    message: string;
    rationale: string;
  };
}

export interface ScanConfig {
  maxDepth: number;
  ignoredFolders: string[];
  ignoredFilePrefix: string[];
  minFileSize: number;
}

export interface TimeFormat {
  standard: string;
  extended: string;
}

export interface Limits {
  itemsPerLoad: number;
  maxPlaylistSize: number;
  minSearchLength: number;
}

export interface Animation {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ScreenNames {
  home: string;
  audioPlayer: string;
  videoPlayer: string;
  playlist: string;
  settings: string;
}

export interface MimeTypes {
  audio: {
    mp3: string;
    m4a: string;
    aac: string;
    wav: string;
    flac: string;
    ogg: string;
  };
  video: {
    mp4: string;
    mkv: string;
    avi: string;
    mov: string;
    wmv: string;
  };
}

export type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'size_asc' | 'size_desc';
export type FilterOption = 'all' | 'audio' | 'video' | 'recent' | 'favorites';
export type LogLevel = 'verbose' | 'error';

export interface SortOptions {
  nameAsc: SortOption;
  nameDesc: SortOption;
  dateAsc: SortOption;
  dateDesc: SortOption;
  sizeAsc: SortOption;
  sizeDesc: SortOption;
}

export interface FilterOptions {
  all: FilterOption;
  audio: FilterOption;
  video: FilterOption;
  recent: FilterOption;
  favorites: FilterOption;
}

export interface Debug {
  enableLogs: boolean;
  showPerformance: boolean;
  logLevel: LogLevel;
}

// ==================== COLORES ====================
export const COLORS: ColorPalette = {
  // Colores principales
  primary: '#1DB954',        // Verde Spotify
  primaryDark: '#1AA34A',
  primaryLight: '#1ED760',
  
  // Colores de fondo
  background: '#121212',
  backgroundLight: '#1e1e1e',
  backgroundDark: '#000000',
  surface: '#2a2a2a',
  
  // Colores de texto
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textDisabled: '#404040',
  
  // Colores de estado
  success: '#1DB954',
  error: '#e22134',
  warning: '#ffa500',
  info: '#1e90ff',
  
  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  
  // Colores de controles
  controlActive: '#1DB954',
  controlInactive: '#404040',
};

// ==================== TAMAÑOS ====================
export const SIZES: SizeConfig = {
  // Espaciado
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 25,
    full: 9999,
  },
  
  // Fuentes
  font: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  
  // Iconos
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },
  
  // Botones
  button: {
    small: 40,
    medium: 50,
    large: 60,
  },
};

// ==================== EXTENSIONES DE ARCHIVO ====================
export const AUDIO_EXTENSIONS: readonly string[] = [
  '.mp3',
  '.m4a',
  '.aac',
  '.wav',
  '.flac',
  '.ogg',
  '.wma',
  '.opus',
  '.webm',
] as const;

export const VIDEO_EXTENSIONS: readonly string[] = [
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.m4v',
  '.3gp',
] as const;

// ==================== RUTAS DE ALMACENAMIENTO ====================
export const STORAGE_PATHS: StoragePaths = {
  android: {
    music: '/Music',
    downloads: '/Download',
    movies: '/Movies',
    dcim: '/DCIM',
    videos: '/Videos',
    podcasts: '/Podcasts',
  },
  ios: {
    documents: 'DocumentDirectory',
    library: 'LibraryDirectory',
  },
};

// ==================== CONFIGURACIÓN DEL REPRODUCTOR ====================
export const PLAYER_CONFIG: PlayerConfig = {
  // Intervalo de actualización del progreso (ms)
  progressUpdateInterval: 1000,
  
  // Tiempo de auto-ocultación de controles de video (ms)
  controlsHideDelay: 3000,
  
  // Tiempo de seek rápido (segundos)
  seekInterval: 10,
  
  // Calidad de reproducción
  quality: {
    low: 'low',
    medium: 'medium',
    high: 'high',
    auto: 'auto',
  },
  
  // Modos de repetición
  repeatMode: {
    off: 'off',
    track: 'track',
    playlist: 'playlist',
  },
  
  // Capacidades del reproductor
  capabilities: [
    'play',
    'pause',
    'skipToNext',
    'skipToPrevious',
    'seekTo',
    'setRating',
  ],
};

// ==================== MENSAJES ====================
export const MESSAGES: Messages = {
  // Errores
  error: {
    permission: 'No se pudo obtener los permisos necesarios',
    loadMedia: 'Error al cargar archivos multimedia',
    playback: 'Error durante la reproducción',
    fileNotFound: 'No se encontró el archivo',
    unsupportedFormat: 'Formato de archivo no soportado',
    networkError: 'Error de conexión',
  },
  
  // Éxito
  success: {
    mediaLoaded: 'Archivos cargados correctamente',
    playbackStarted: 'Reproducción iniciada',
  },
  
  // Información
  info: {
    noFiles: 'No se encontraron archivos',
    scanning: 'Escaneando archivos multimedia...',
    loading: 'Cargando...',
    processing: 'Procesando...',
  },
  
  // Permisos
  permissions: {
    title: 'Permisos necesarios',
    message: 'VibeBox necesita acceso a tu almacenamiento para reproducir archivos multimedia',
    rationale: 'Esta app necesita acceso al almacenamiento para leer tus archivos de audio y video',
  },
};

// ==================== CONFIGURACIÓN DE ESCANEO ====================
export const SCAN_CONFIG: ScanConfig = {
  // Profundidad máxima de carpetas a escanear
  maxDepth: 3,
  
  // Carpetas a ignorar
  ignoredFolders: [
    'Android',
    '.android',
    '.thumbnails',
    '.cache',
    'cache',
    'Cache',
    'temp',
    'Temp',
    '.nomedia',
  ],
  
  // Archivos a ignorar (que empiecen con)
  ignoredFilePrefix: ['.', '._'],
  
  // Tamaño mínimo de archivo (bytes) - ignora archivos muy pequeños
  minFileSize: 1024, // 1 KB
  
  // Tamaño máximo de archivo (bytes) - opcional
  // maxFileSize: 5368709120, // 5 GB
};

// ==================== FORMATO DE TIEMPO ====================
export const TIME_FORMAT: TimeFormat = {
  standard: 'mm:ss',
  extended: 'hh:mm:ss',
};

// ==================== LÍMITES ====================
export const LIMITS: Limits = {
  // Límite de archivos a mostrar por carga
  itemsPerLoad: 50,
  
  // Límite de archivos en playlist
  maxPlaylistSize: 1000,
  
  // Límite de búsqueda (caracteres mínimos)
  minSearchLength: 2,
};

// ==================== ANIMACIONES ====================
export const ANIMATION: Animation = {
  // Duración de animaciones (ms)
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Tipos de easing
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ==================== NAVEGACIÓN ====================
export const SCREEN_NAMES: ScreenNames = {
  home: 'Home',
  audioPlayer: 'AudioPlayer',
  videoPlayer: 'VideoPlayer',
  playlist: 'Playlist',
  settings: 'Settings',
};

// ==================== MIME TYPES ====================
export const MIME_TYPES: MimeTypes = {
  audio: {
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    wav: 'audio/wav',
    flac: 'audio/flac',
    ogg: 'audio/ogg',
  },
  video: {
    mp4: 'video/mp4',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
  },
};

// ==================== SORTING OPTIONS ====================
export const SORT_OPTIONS: SortOptions = {
  nameAsc: 'name_asc',
  nameDesc: 'name_desc',
  dateAsc: 'date_asc',
  dateDesc: 'date_desc',
  sizeAsc: 'size_asc',
  sizeDesc: 'size_desc',
};

// ==================== FILTROS ====================
export const FILTER_OPTIONS: FilterOptions = {
  all: 'all',
  audio: 'audio',
  video: 'video',
  recent: 'recent',
  favorites: 'favorites',
};

// ==================== CONFIGURACIÓN DE DEBUG ====================
export const DEBUG: Debug = {
  enableLogs: __DEV__,
  showPerformance: __DEV__,
  logLevel: __DEV__ ? 'verbose' : 'error',
};

// ==================== EXPORT DEFAULT ====================
export default {
  COLORS,
  SIZES,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
  STORAGE_PATHS,
  PLAYER_CONFIG,
  MESSAGES,
  SCAN_CONFIG,
  TIME_FORMAT,
  LIMITS,
  ANIMATION,
  SCREEN_NAMES,
  MIME_TYPES,
  SORT_OPTIONS,
  FILTER_OPTIONS,
  DEBUG,
};
