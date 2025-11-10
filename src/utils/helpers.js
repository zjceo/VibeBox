import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from './constants';

/**
 * Formatea el tamaño de archivo en bytes a una cadena legible
 * @param {number} bytes - Tamaño en bytes
 * @param {number} decimals - Número de decimales
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes, decimals = 2) => {
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
export const formatTime = (seconds, forceHours = false) => {
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
export const isAudioFile = (filename) => {
  if (!filename) return false;
  const extension = getFileExtension(filename).toLowerCase();
  return AUDIO_EXTENSIONS.includes(extension);
};

/**
 * Verifica si un archivo es de video basándose en su extensión
 * @param {string} filename - Nombre del archivo
 * @returns {boolean}
 */
export const isVideoFile = (filename) => {
  if (!filename) return false;
  const extension = getFileExtension(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(extension);
};

/**
 * Obtiene la extensión de un archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Extensión con punto (ej: '.mp3')
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
};

/**
 * Obtiene el nombre del archivo sin extensión
 * @param {string} filename - Nombre del archivo
 * @returns {string} Nombre sin extensión
 */
export const getFileNameWithoutExtension = (filename) => {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
};

/**
 * Sanitiza el nombre del archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Nombre sanitizado
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return '';
  return filename.replace(/[/\\?%*:|"<>]/g, '-').trim();
};

/**
 * Genera un ID único basado en timestamp y random
 * @returns {string} ID único
 */
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mezcla aleatoriamente un array (shuffle)
 * @param {Array} array - Array a mezclar
 * @returns {Array} Array mezclado
 */
export const shuffleArray = (array) => {
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
export const sortByProperty = (array, property, order = 'asc') => {
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
 * @param {Array} files - Array de archivos
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Archivos filtrados
 */
export const filterFiles = (files, searchTerm) => {
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
export const groupBy = (files, property) => {
  return files.reduce((acc, file) => {
    const key = file[property] || 'unknown';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(file);
    return acc;
  }, {});
};

/**
 * Debounce function
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
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
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
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
export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
};

/**
 * Verifica si es un archivo oculto
 * @param {string} filename - Nombre del archivo
 * @returns {boolean}
 */
export const isHiddenFile = (filename) => {
  if (!filename) return false;
  return filename.startsWith('.') || filename.startsWith('._');
};

/**
 * Obtiene el tipo de archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} 'audio', 'video' o 'unknown'
 */
export const getFileType = (filename) => {
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
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convierte una ruta de archivo a URI
 * @param {string} path - Ruta del archivo
 * @param {string} platform - 'android' o 'ios'
 * @returns {string} URI del archivo
 */
export const pathToUri = (path, platform) => {
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
export const isValidUrl = (url) => {
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
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};