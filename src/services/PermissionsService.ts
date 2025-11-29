// src/services/PermissionsService.ts
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

/**
 * Servicio para manejar permisos de almacenamiento en Android e iOS
 */
class PermissionsService {
  /**
   * Solicita permisos de almacenamiento según la versión de Android
   * @returns {Promise<boolean>} true si se concedieron los permisos
   */
  async requestStoragePermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version as number;

        // Android 13+ (API 33+) usa permisos granulares
        if (androidVersion >= 33) {
          const audioPermission = await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);
          const videoPermission = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);

          return audioPermission === RESULTS.GRANTED && videoPermission === RESULTS.GRANTED;
        } else {
          // Android 12 y anteriores
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Permiso de Almacenamiento',
              message: 'VibeBox necesita acceso a tus archivos multimedia',
              buttonNeutral: 'Preguntar después',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      }

      // iOS maneja permisos automáticamente
      return true;
    } catch (err) {
      console.warn('Error requesting permissions:', err);
      return false;
    }
  }

  /**
   * Verifica si los permisos de almacenamiento están concedidos
   * @returns {Promise<boolean>} true si los permisos están concedidos
   */
  async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version as number;

      if (androidVersion >= 33) {
        const audioStatus = await check(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);
        const videoStatus = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
        return audioStatus === RESULTS.GRANTED && videoStatus === RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted;
      }
    }
    return true;
  }
}

export default new PermissionsService();