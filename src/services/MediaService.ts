// src/services/MediaService.ts
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './DatabaseService';
import type { MediaFile } from '../types';

const CACHE_EXPIRY_HOURS = 24;
const CACHE_TIMESTAMP_KEY = '@vibebox_cache_timestamp';

interface MediaScanResult {
  audio: MediaFile[];
  video: MediaFile[];
}

interface CacheStats {
  totalFiles: number;
  audioFiles: number;
  videoFiles: number;
  cacheDate: Date | null;
  isValid: boolean;
}

interface FileItem {
  path: string;
  name: string;
  size: number;
  isDirectory: () => boolean;
  isFile: () => boolean;
}

class MediaService {
  private audioExtensions = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'];
  private videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv'];
  public customPaths: string[] = [];
  private readonly STORAGE_KEY = '@vibebox_custom_paths';
  private isScanning = false;

  constructor() {
    this.loadCustomPaths();
  }

  public async loadCustomPaths(): Promise<void> {
    try {
      const storedPaths = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedPaths) {
        this.customPaths = JSON.parse(storedPaths);
      }
    } catch (error) {
      console.error('Error loading custom paths:', error);
    }
  }

  private async saveCustomPaths(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customPaths));
    } catch (error) {
      console.error('Error saving custom paths:', error);
    }
  }

  async addCustomPath(path: string): Promise<boolean> {
    if (!this.customPaths.includes(path)) {
      this.customPaths.push(path);
      await this.saveCustomPaths();
      return true;
    }
    return false;
  }

  async removeCustomPath(path: string): Promise<boolean> {
    const initialLength = this.customPaths.length;
    this.customPaths = this.customPaths.filter(p => p !== path);
    if (this.customPaths.length !== initialLength) {
      await this.saveCustomPaths();
      return true;
    }
    return false;
  }

  public getMediaPaths(): string[] {
    let paths: string[] = [];

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

  private async isCacheValid(): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;

      const cacheAge = Date.now() - parseInt(timestamp);
      const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

      return cacheAge < maxAge;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  private async updateCacheTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error updating cache timestamp:', error);
    }
  }

  async scanMediaFiles(forceRescan = false): Promise<MediaScanResult> {
    try {
      if (!forceRescan) {
        const cacheValid = await this.isCacheValid();

        if (cacheValid) {
          console.log('✅ Loading from valid cache...');

          try {
            const cachedFiles = await DatabaseService.getMediaFiles();

            if (cachedFiles && cachedFiles.length > 0) {
              console.log(`✅ Loaded ${cachedFiles.length} files from cache`);
              const audio = cachedFiles.filter(f => f.type === 'audio');
              const video = cachedFiles.filter(f => f.type === 'video');

              setTimeout(() => this.smartBackgroundScan(), 5000);

              return { audio, video };
            }
          } catch (dbError) {
            console.error('❌ Database error, forcing rescan:', dbError);
            forceRescan = true;
          }
        } else {
          console.log('⚠️ Cache expired or invalid');
        }
      }

      console.log('🔍 Performing full scan...');
      return await this.performFullScan();
    } catch (error) {
      console.error('Error scanning media files:', error);
      return { audio: [], video: [] };
    }
  }

  private async smartBackgroundScan(): Promise<void> {
    if (this.isScanning) {
      console.log('⏭️ Scan already in progress, skipping');
      return;
    }

    this.isScanning = true;

    try {
      console.log('🔄 Starting smart background scan...');

      const cachedFiles = await DatabaseService.getMediaFiles();
      const cachedCount = cachedFiles.length;

      const quickCount = await this.quickScanCount();

      const difference = Math.abs(quickCount - cachedCount);
      const threshold = cachedCount * 0.05;

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

  private async quickScanCount(): Promise<number> {
    let count = 0;
    const paths = this.getMediaPaths();

    for (const path of paths) {
      try {
        const exists = await RNFS.exists(path);
        if (exists) {
          count += await this.countFilesInDirectory(path, 0, 2);
        }
      } catch (error) {
        // Ignorar errores
      }
    }

    return count;
  }

  private async countFilesInDirectory(
    directoryPath: string,
    depth = 0,
    maxDepth = 2
  ): Promise<number> {
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

  private async performFullScan(): Promise<MediaScanResult> {
    const startTime = Date.now();
    await this.loadCustomPaths();
    const paths = this.getMediaPaths();
    const allMedia: MediaScanResult = { audio: [], video: [] };

    console.log(`🔍 Scanning ${paths.length} paths...`);

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

    results.forEach(result => {
      allMedia.audio.push(...result.audio);
      allMedia.video.push(...result.video);
    });

    allMedia.audio = this.removeDuplicates(allMedia.audio);
    allMedia.video = this.removeDuplicates(allMedia.video);

    console.log(`✅ Found ${allMedia.audio.length} audio, ${allMedia.video.length} video files`);

    const allFiles = [...allMedia.audio, ...allMedia.video];
    await DatabaseService.saveMediaFiles(allFiles);
    await this.updateCacheTimestamp();

    const scanTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️ Scan completed in ${scanTime}s`);

    return allMedia;
  }

  private removeDuplicates(mediaArray: MediaFile[]): MediaFile[] {
    const seen = new Map<string, boolean>();
    return mediaArray.filter(item => {
      if (seen.has(item.path)) {
        return false;
      }
      seen.set(item.path, true);
      return true;
    });
  }

  private async scanDirectory(
    directoryPath: string,
    depth = 0,
    maxDepth = 3
  ): Promise<MediaScanResult> {
    const media: MediaScanResult = { audio: [], video: [] };

    if (depth > maxDepth) return media;

    try {
      const items = await RNFS.readDir(directoryPath);

      const directories: FileItem[] = [];
      const files: FileItem[] = [];

      items.forEach(item => {
        if (item.isDirectory()) {
          if (!item.name.startsWith('.') &&
            !item.name.startsWith('Android') &&
            item.name !== 'cache' &&
            item.name !== 'Cache') {
            directories.push(item as unknown as FileItem);
          }
        } else if (item.isFile()) {
          files.push(item as unknown as FileItem);
        }
      });

      files.forEach(item => {
        const extension = item.name.substring(item.name.lastIndexOf('.')).toLowerCase();
        // Guardar el nombre SIN la extensión para display
        const displayName = item.name.substring(0, item.name.lastIndexOf('.'));

        if (this.audioExtensions.includes(extension)) {
          media.audio.push({
            id: item.path,
            filename: displayName, // Sin extensión para mostrar
            name: displayName, // Alias para compatibilidad
            title: displayName, // Alias para compatibilidad
            path: item.path, // Path completo con extensión para reproducir
            extension: extension, // Guardar la extensión
            size: item.size,
            type: 'audio',
            dateAdded: Date.now(),
            lastModified: Date.now(),
          });
        } else if (this.videoExtensions.includes(extension)) {
          media.video.push({
            id: item.path,
            filename: displayName, // Sin extensión para mostrar
            name: displayName, // Alias para compatibilidad
            title: displayName, // Alias para compatibilidad
            path: item.path, // Path completo con extensión para reproducir
            extension: extension, // Guardar la extensión
            size: item.size,
            type: 'video',
            dateAdded: Date.now(),
            lastModified: Date.now(),
          });
        }
      });

      for (const dir of directories) {
        const subMedia = await this.scanDirectory(dir.path, depth + 1, maxDepth);
        media.audio.push(...subMedia.audio);
        media.video.push(...subMedia.video);
      }
    } catch (error) {
      // Ignorar errores de permisos
    }

    return media;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async clearCache(): Promise<void> {
    try {
      await DatabaseService.clearCache();
      await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheStats(): Promise<CacheStats | null> {
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