import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './DatabaseService';

const CACHE_EXPIRY_HOURS = 24; // Caché válido por 24 horas
const CACHE_TIMESTAMP_KEY = '@vibebox_cache_timestamp';

class MediaService {
  audioExtensions = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'];
  videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv'];
  customPaths = [];
  STORAGE_KEY = '@vibebox_custom_paths';
  isScanning = false; // Flag para evitar escaneos múltiples

  constructor() {
    this.loadCustomPaths();
  }

  async loadCustomPaths() {
    try {
      const storedPaths = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedPaths) {
        this.customPaths = JSON.parse(storedPaths);
      }
    } catch (error) {
      console.error('Error loading custom paths:', error);
    }
  }

  async saveCustomPaths() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customPaths));
    } catch (error) {
      console.error('Error saving custom paths:', error);
    }
  }

  async addCustomPath(path) {
    if (!this.customPaths.includes(path)) {
      this.customPaths.push(path);
      await this.saveCustomPaths();
      return true;
    }
    return false;
  }

  async removeCustomPath(path) {
    const initialLength = this.customPaths.length;
    this.customPaths = this.customPaths.filter(p => p !== path);
    if (this.customPaths.length !== initialLength) {
      await this.saveCustomPaths();
      return true;
    }
    return false;
  }

  getMediaPaths() {
    let paths = [];

    if (Platform.OS === 'android') {
      paths = [
        `${RNFS.ExternalStorageDirectoryPath}/Music`,
        `${RNFS.ExternalStorageDirectoryPath}/Download`,
        `${RNFS.ExternalStorageDirectoryPath}/Movies`,
        `${RNFS.ExternalStorageDirectoryPath}/DCIM`,
      ];
    } else {
      paths = [
        RNFS.DocumentDirectoryPath,
        RNFS.LibraryDirectoryPath,
      ];
    }

    return [...paths, ...this.customPaths];
  }

  /**
   * Verifica si el caché es válido
   */
  async isCacheValid() {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;

      const cacheAge = Date.now() - parseInt(timestamp);
      const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // Convertir a ms

      return cacheAge < maxAge;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Actualiza el timestamp del caché
   */
  async updateCacheTimestamp() {
    try {
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error updating cache timestamp:', error);
    }
  }

  /**
   * Método principal para escanear archivos
   */
  async scanMediaFiles(forceRescan = false) {
    try {
      // Verificar si el caché es válido y no se fuerza el reescaneo
      if (!forceRescan) {
        const cacheValid = await this.isCacheValid();

        if (cacheValid) {
          console.log('✅ Loading from valid cache...');
          const cachedFiles = await DatabaseService.getMediaFiles();

          if (cachedFiles && cachedFiles.length > 0) {
            console.log(`✅ Loaded ${cachedFiles.length} files from cache`);
            const audio = cachedFiles.filter(f => f.type === 'audio');
            const video = cachedFiles.filter(f => f.type === 'video');

            // Opcionalmente, escanear en background después de 5 segundos
            setTimeout(() => this.smartBackgroundScan(), 5000);

            return { audio, video };
          }
        } else {
          console.log('⚠️ Cache expired or invalid');
        }
      }

      // Si no hay caché válido o se fuerza, hacer scan completo
      console.log('🔍 Performing full scan...');
      return await this.performFullScan();

    } catch (error) {
      console.error('Error scanning media files:', error);
      return { audio: [], video: [] };
    }
  }

  /**
   * Escaneo inteligente en background que solo actualiza si detecta cambios
   */
  async smartBackgroundScan() {
    if (this.isScanning) {
      console.log('⏭️ Scan already in progress, skipping');
      return;
    }

    this.isScanning = true;

    try {
      console.log('🔄 Starting smart background scan...');

      // Obtener archivos actuales del caché
      const cachedFiles = await DatabaseService.getMediaFiles();
      const cachedCount = cachedFiles.length;

      // Hacer un escaneo rápido contando archivos
      const quickCount = await this.quickScanCount();

      // Solo hacer scan completo si hay diferencia significativa (>5%)
      const difference = Math.abs(quickCount - cachedCount);
      const threshold = cachedCount * 0.05; // 5% de cambio

      if (difference > threshold) {
        console.log(`📊 Detected ${difference} file changes, updating...`);
        await this.performFullScan();
      } else {
        console.log('✅ No significant changes detected');
      }

    } catch (error) {
      console.error('Background scan failed:', error);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Conteo rápido de archivos sin crear objetos completos
   */
  async quickScanCount() {
    let count = 0;
    const paths = this.getMediaPaths();

    for (const path of paths) {
      try {
        const exists = await RNFS.exists(path);
        if (exists) {
          count += await this.countFilesInDirectory(path, 0, 2); // Solo 2 niveles
        }
      } catch (error) {
        // Ignorar errores en conteo rápido
      }
    }

    return count;
  }

  /**
   * Cuenta archivos multimedia sin crear objetos
   */
  async countFilesInDirectory(directoryPath, depth = 0, maxDepth = 2) {
    if (depth > maxDepth) return 0;

    let count = 0;

    try {
      const items = await RNFS.readDir(directoryPath);

      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          count += await this.countFilesInDirectory(item.path, depth + 1, maxDepth);
        } else if (item.isFile()) {
          const ext = item.name.substring(item.name.lastIndexOf('.')).toLowerCase();
          if (this.audioExtensions.includes(ext) || this.videoExtensions.includes(ext)) {
            count++;
          }
        }
      }
    } catch (error) {
      // Ignorar errores
    }

    return count;
  }

  /**
   * Escaneo completo del sistema
   */
  async performFullScan() {
    const startTime = Date.now();
    await this.loadCustomPaths();
    const paths = this.getMediaPaths();
    const allMedia = { audio: [], video: [] };

    console.log(`🔍 Scanning ${paths.length} paths...`);

    // Escanear cada ruta en paralelo para mayor velocidad
    const scanPromises = paths.map(async (path) => {
      try {
        const exists = await RNFS.exists(path);
        if (exists) {
          return await this.scanDirectory(path);
        }
      } catch (error) {
        console.error(`Error scanning ${path}:`, error);
      }
      return { audio: [], video: [] };
    });

    const results = await Promise.all(scanPromises);

    // Combinar resultados
    results.forEach(result => {
      allMedia.audio.push(...result.audio);
      allMedia.video.push(...result.video);
    });

    // Eliminar duplicados
    allMedia.audio = this.removeDuplicates(allMedia.audio);
    allMedia.video = this.removeDuplicates(allMedia.video);

    console.log(`✅ Found ${allMedia.audio.length} audio, ${allMedia.video.length} video files`);

    // Guardar en DB y actualizar timestamp
    const allFiles = [...allMedia.audio, ...allMedia.video];
    await DatabaseService.saveMediaFiles(allFiles);
    await this.updateCacheTimestamp();

    const scanTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️ Scan completed in ${scanTime}s`);

    return allMedia;
  }

  /**
   * Elimina duplicados basándose en la ruta
   */
  removeDuplicates(mediaArray) {
    const seen = new Map();
    return mediaArray.filter(item => {
      if (seen.has(item.path)) {
        return false;
      }
      seen.set(item.path, true);
      return true;
    });
  }

  /**
   * Escanea un directorio recursivamente
   */
  async scanDirectory(directoryPath, depth = 0, maxDepth = 3) {
    const media = { audio: [], video: [] };

    if (depth > maxDepth) return media;

    try {
      const items = await RNFS.readDir(directoryPath);

      // Procesar directorios y archivos por separado
      const directories = [];
      const files = [];

      items.forEach(item => {
        if (item.isDirectory()) {
          // Filtrar carpetas del sistema
          if (!item.name.startsWith('.') &&
            !item.name.startsWith('Android') &&
            item.name !== 'cache' &&
            item.name !== 'Cache') {
            directories.push(item);
          }
        } else if (item.isFile()) {
          files.push(item);
        }
      });

      // Procesar archivos del directorio actual
      files.forEach(item => {
        const extension = item.name.substring(item.name.lastIndexOf('.')).toLowerCase();

        if (this.audioExtensions.includes(extension)) {
          media.audio.push({
            id: item.path,
            name: item.name.replace(extension, ''),
            path: item.path,
            size: item.size,
            extension: extension,
            type: 'audio',
            uri: Platform.OS === 'android' ? `file://${item.path}` : item.path,
          });
        } else if (this.videoExtensions.includes(extension)) {
          media.video.push({
            id: item.path,
            name: item.name.replace(extension, ''),
            path: item.path,
            size: item.size,
            extension: extension,
            type: 'video',
            uri: Platform.OS === 'android' ? `file://${item.path}` : item.path,
          });
        }
      });

      // Escanear subdirectorios recursivamente
      for (const dir of directories) {
        const subMedia = await this.scanDirectory(dir.path, depth + 1, maxDepth);
        media.audio.push(...subMedia.audio);
        media.video.push(...subMedia.video);
      }

    } catch (error) {
      // Silenciosamente ignorar errores de permisos
    }

    return media;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  groupMediaByFolder(mediaArray) {
    const grouped = {};

    mediaArray.forEach(item => {
      const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
      const folderName = parentPath.substring(parentPath.lastIndexOf('/') + 1);

      if (!grouped[folderName]) {
        grouped[folderName] = [];
      }
      grouped[folderName].push(item);
    });

    return Object.keys(grouped).map(folderName => ({
      title: folderName,
      data: grouped[folderName],
    }));
  }

  /**
   * Limpia el caché forzando un nuevo escaneo en la próxima carga
   */
  async clearCache() {
    try {
      await DatabaseService.clearCache();
      await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  async getCacheStats() {
    try {
      const files = await DatabaseService.getMediaFiles();
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      const isValid = await this.isCacheValid();

      return {
        totalFiles: files.length,
        audioFiles: files.filter(f => f.type === 'audio').length,
        videoFiles: files.filter(f => f.type === 'video').length,
        cacheDate: timestamp ? new Date(parseInt(timestamp)) : null,
        isValid,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }
}

export default new MediaService();