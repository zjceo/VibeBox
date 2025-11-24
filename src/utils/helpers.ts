import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from './constants';

/**
 * Formatea el tamaño de archivo en bytes a una cadena legible
 * @param {number} bytes - Tamaño en bytes
 * @param {number} decimals - Número de decimales
 * @returns {string} Tamaño formateado
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
 * @param {number} seconds - Tiempo en segundos
 * @param {boolean} forceHours - Forzar formato con horas
 * @returns {string} Tiempo formateado
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
 * @param {string} filename - Nombre del archivo
 * @returns {boolean}
 */
export const isAudioFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = getFileExtension(filename).toLowerCase();
    return AUDIO_EXTENSIONS.includes(extension);
};

/**
 * Verifica si un archivo es de video basándose en su extensión
 * @param {string} filename - Nombre del archivo
 * @returns {boolean}
 */
export const isVideoFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = getFileExtension(filename).toLowerCase();
    return VIDEO_EXTENSIONS.includes(extension);
};

/**
 * Obtiene la extensión de un archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Extensión con punto (ej: '.mp3')
 */
export const getFileExtension = (filename: string): string => {
    if (!filename) return '';
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
};

/**
 * Obtiene el nombre del archivo sin extensión
 * @param {string} filename - Nombre del archivo
 * @returns {string} Nombre sin extensión
 */
export const getFileNameWithoutExtension = (filename: string): string => {
    if (!filename) return '';
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
};

/**
 * Sanitiza el nombre del archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Nombre sanitizado
 */
export const sanitizeFilename = (filename: string): string => {
    if (!filename) return '';
    return filename.replace(/[/\\?%*:|"<>]/g, '-').trim();
};

/**
 * Genera un ID único basado en timestamp y random
 * @returns {string} ID único
 */
export const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mezcla aleatoriamente un array (shuffle)
 * @param {Array} array - Array a mezclar
 * @returns {Array} Array mezclado
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
 * @param {Array} array - Array a ordenar
 * @param {string} property - Propiedad por la cual ordenar
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
export const sortByProperty = <T>(array: T[], property: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return order === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        // @ts-ignore - Assuming numbers if not strings
        return order === 'asc' ? aVal - bVal : bVal - aVal;
    });
};

/**
 * Filtra archivos por término de búsqueda
 * @param {Array} files - Array de archivos
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Archivos filtrados
 */
export const filterFiles = <T extends { name: string; path: string }>(files: T[], searchTerm: string): T[] => {
    if (!searchTerm || searchTerm.trim() === '') return files;

    const term = searchTerm.toLowerCase().trim();

    return files.filter(file =>
        file.name.toLowerCase().includes(term) ||
        file.path.toLowerCase().includes(term)
    );
};

/**
 * Agrupa archivos por una propiedad
 * @param {Array} files - Array de archivos
 * @param {string} property - Propiedad para agrupar
 * @returns {Object} Objeto con archivos agrupados
 */
export const groupBy = <T>(files: T[], property: keyof T): Record<string, T[]> => {
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
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
export const debounce = (func: Function, wait: number): Function => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
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
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} Función con throttle
 */
export const throttle = (func: Function, limit: number): Function => {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Calcula el porcentaje de progreso
 * @param {number} current - Valor actual
 * @param {number} total - Valor total
 * @returns {number} Porcentaje (0-100)
 */
export const calculateProgress = (current: number, total: number): number => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.max(0, (current / total) * 100));
};

/**
 * Verifica si es un archivo oculto
 * @param {string} filename - Nombre del archivo
 * @returns {boolean}
 */
export const isHiddenFile = (filename: string): boolean => {
    if (!filename) return false;
    return filename.startsWith('.') || filename.startsWith('._');
};

/**
 * Obtiene el tipo de archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} 'audio', 'video' o 'unknown'
 */
export const getFileType = (filename: string): 'audio' | 'video' | 'unknown' => {
    if (isAudioFile(filename)) return 'audio';
    if (isVideoFile(filename)) return 'video';
    return 'unknown';
};

/**
 * Trunca un texto a un número específico de caracteres
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar
 * @returns {string} Texto truncado
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convierte una ruta de archivo a URI
 * @param {string} path - Ruta del archivo
 * @param {string} platform - 'android' o 'ios'
 * @returns {string} URI del archivo
 */
export const pathToUri = (path: string, platform: string): string => {
    if (!path) return '';
    if (platform === 'android' && !path.startsWith('file://')) {
        return `file://${path}`;
    }
    return path;
};

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean}
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
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
