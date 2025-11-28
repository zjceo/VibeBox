import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

class MediaService {
  audioExtensions = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'];
  videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv'];

  // Rutas principales según la plataforma
  getMediaPaths() {
    if (Platform.OS === 'android') {
      return [
        `${RNFS.ExternalStorageDirectoryPath}/Music`,
        `${RNFS.ExternalStorageDirectoryPath}/Download`,
        `${RNFS.ExternalStorageDirectoryPath}/Movies`,
        `${RNFS.ExternalStorageDirectoryPath}/DCIM`,
        RNFS.ExternalStorageDirectoryPath,
      ];
    } else {
      return [
        RNFS.DocumentDirectoryPath,
        RNFS.LibraryDirectoryPath,
      ];
    }
  }

  async scanMediaFiles() {
    try {
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
      console.error(`Error scanning directory ${directoryPath}:`, error);
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
}

export default new MediaService();