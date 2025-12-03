import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from './constants';

/**
 * Formatea el tamaño de archivo en bytes a una cadena legible
 * @param bytes - Tamaño en bytes
 * @param decimals - Número de decimales
 * @returns Tamaño formateado
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formatea el tiempo en segundos a mm:ss o hh:mm:ss
 * @param seconds - Tiempo en segundos
 * @param forceHours - Forzar formato con horas
 * @returns Tiempo formateado
 */
export const formatTime = (seconds: number, forceHours: boolean = false): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0 || forceHours) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Verifica si un archivo es de audio basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es un archivo de audio
 */
export const isAudioFile = (filename: string): boolean => {
  if (!filename) return false;
  const extension = getFileExtension(filename).toLowerCase();
  return AUDIO_EXTENSIONS.includes(extension);
};

/**
 * Verifica si un archivo es de video basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es un archivo de video
 */
export const isVideoFile = (filename: string): boolean => {
  if (!filename) return false;
  const extension = getFileExtension(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(extension);
};

/**
 * Obtiene la extensión de un archivo
 * @param filename - Nombre del archivo
 * @returns Extensión con punto (ej: '.mp3')
 */
export const getFileExtension = (filename: string): string => {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
};

/**
 * Obtiene el nombre del archivo sin extensión
 * @param filename - Nombre del archivo
 * @returns Nombre sin extensión
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
};

/**
 * Sanitiza el nombre del archivo
 * @param filename - Nombre del archivo
 * @returns Nombre sanitizado
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  return filename.replace(/[/\\?%*:|"<>]/g, '-').trim();
};

/**
 * Genera un ID único basado en timestamp y random
 * @returns ID único
 */
export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mezcla aleatoriamente un array (shuffle)
 * @param array - Array a mezclar
 * @returns Array mezclado
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Ordena un array de objetos por una propiedad
 * @param array - Array a ordenar
 * @param property - Propiedad por la cual ordenar
 * @param order - 'asc' o 'desc'
 * @returns Array ordenado
 */
export const sortByProperty = <T extends Record<string, any>>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
};

/**
 * Filtra archivos por término de búsqueda
 * @param files - Array de archivos
 * @param searchTerm - Término de búsqueda
 * @returns Archivos filtrados
 */
export const filterFiles = <T extends { name: string; path: string }>(
  files: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm || searchTerm.trim() === '') return files;
  
  const term = searchTerm.toLowerCase().trim();
  
  return files.filter(file => 
    file.name.toLowerCase().includes(term) ||
    file.path.toLowerCase().includes(term)
  );
};

/**
 * Agrupa archivos por una propiedad
 * @param files - Array de archivos
 * @param property - Propiedad para agrupar
 * @returns Objeto con archivos agrupados
 */
export const groupBy = <T extends Record<string, any>>(
  files: T[],
  property: keyof T
): Record<string, T[]> => {
  return files.reduce((acc, file) => {
    const key = String(file[property] || 'unknown');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(file);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Debounce function
 * @param func - Función a ejecutar
 * @param wait - Tiempo de espera en ms
 * @returns Función con debounce
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | undefined;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param func - Función a ejecutar
 * @param limit - Límite de tiempo en ms
 * @returns Función con throttle
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Calcula el porcentaje de progreso
 * @param current - Valor actual
 * @param total - Valor total
 * @returns Porcentaje (0-100)
 */
export const calculateProgress = (current: number, total: number): number => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
};

/**
 * Verifica si es un archivo oculto
 * @param filename - Nombre del archivo
 * @returns true si es un archivo oculto
 */
export const isHiddenFile = (filename: string): boolean => {
  if (!filename) return false;
  return filename.startsWith('.') || filename.startsWith('._');
};

/**
 * Obtiene el tipo de archivo
 * @param filename - Nombre del archivo
 * @returns 'audio', 'video' o 'unknown'
 */
export const getFileType = (filename: string): 'audio' | 'video' | 'unknown' => {
  if (isAudioFile(filename)) return 'audio';
  if (isVideoFile(filename)) return 'video';
  return 'unknown';
};

/**
 * Trunca un texto a un número específico de caracteres
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @param suffix - Sufijo a agregar
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitaliza la primera letra de un string
 * @param str - String a capitalizar
 * @returns String capitalizado
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convierte una ruta de archivo a URI
 * @param path - Ruta del archivo
 * @param platform - 'android' o 'ios'
 * @returns URI del archivo
 */
export const pathToUri = (path: string, platform: 'android' | 'ios'): string => {
  if (!path) return '';
  if (platform === 'android' && !path.startsWith('file://')) {
    return `file://${path}`;
  }
  return path;
};

/**
 * Valida si una URL es válida
 * @param url - URL a validar
 * @returns true si es válida
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Delay/Sleep function
 * @param ms - Milisegundos a esperar
 * @returns Promise que se resuelve después del delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
