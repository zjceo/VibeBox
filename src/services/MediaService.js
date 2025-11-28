import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MediaService {
  audioExtensions = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'];
  videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv'];
  customPaths = [];
  STORAGE_KEY = '@vibebox_custom_paths';

  constructor() {
    this.loadCustomPaths();
  }

  // Cargar rutas personalizadas desde AsyncStorage
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

  // Guardar rutas personalizadas
  async saveCustomPaths() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customPaths));
    } catch (error) {
      console.error('Error saving custom paths:', error);
    }
  }

  // Añadir una nueva ruta
  async addCustomPath(path) {
    if (!this.customPaths.includes(path)) {
      this.customPaths.push(path);
      await this.saveCustomPaths();
      return true;
    }
    return false;
  }

  // Eliminar una ruta
  async removeCustomPath(path) {
    const initialLength = this.customPaths.length;
    this.customPaths = this.customPaths.filter(p => p !== path);
    if (this.customPaths.length !== initialLength) {
      await this.saveCustomPaths();
      return true;
    }
    return false;
  }

  // Obtener todas las rutas (sistema + personalizadas)
  getMediaPaths() {
    let paths = [];

    if (Platform.OS === 'android') {
      paths = [
        `${RNFS.ExternalStorageDirectoryPath}/Music`,
        `${RNFS.ExternalStorageDirectoryPath}/Download`,
        `${RNFS.ExternalStorageDirectoryPath}/Movies`,
        `${RNFS.ExternalStorageDirectoryPath}/DCIM`,
        RNFS.ExternalStorageDirectoryPath,
      ];
    } else {
      paths = [
        RNFS.DocumentDirectoryPath,
        RNFS.LibraryDirectoryPath,
      ];
    }

    return [...paths, ...this.customPaths];
  }

  async scanMediaFiles() {
    try {
      // Asegurarse de tener las rutas más recientes
      await this.loadCustomPaths();

      const paths = this.getMediaPaths();
      const allMedia = {
        audio: [],
        video: [],
      };

      for (const path of paths) {
        const exists = await RNFS.exists(path);
        if (exists) {
          const files = await this.scanDirectory(path);
          allMedia.audio.push(...files.audio);
          allMedia.video.push(...files.video);
        }
      }

      // Eliminar duplicados basándose en la ruta del archivo
      allMedia.audio = this.removeDuplicates(allMedia.audio);
      allMedia.video = this.removeDuplicates(allMedia.video);

      return allMedia;
    } catch (error) {
      console.error('Error scanning media files:', error);
      return { audio: [], video: [] };
    }
  }

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

  async scanDirectory(directoryPath, depth = 0, maxDepth = 3) {
    const media = { audio: [], video: [] };

    if (depth > maxDepth) return media;

    try {
      const items = await RNFS.readDir(directoryPath);

      for (const item of items) {
        if (item.isDirectory()) {
          // Evitar carpetas del sistema
          if (!item.name.startsWith('.') && !item.name.startsWith('Android')) {
            const subMedia = await this.scanDirectory(item.path, depth + 1, maxDepth);
            media.audio.push(...subMedia.audio);
            media.video.push(...subMedia.video);
          }
        } else if (item.isFile()) {
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
        }
      }
    } catch (error) {
      // console.error(`Error scanning directory ${directoryPath}:`, error);
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
      // Obtener el nombre de la carpeta padre
      // item.path es algo como /storage/.../Music/MySong.mp3
      // Queremos "Music"
      const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
      const folderName = parentPath.substring(parentPath.lastIndexOf('/') + 1);

      if (!grouped[folderName]) {
        grouped[folderName] = [];
      }
      grouped[folderName].push(item);
    });

    // Convertir a array de secciones para SectionList o similar
    return Object.keys(grouped).map(folderName => ({
      title: folderName,
      data: grouped[folderName],
    }));
  }
}

export default new MediaService();