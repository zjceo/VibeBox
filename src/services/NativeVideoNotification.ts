import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

interface VideoNotificationModule {
    showNotification: (title: string, isPlaying: boolean) => void;
    hideNotification: () => void;
    updatePlaybackState: (isPlaying: boolean) => void;
}

const { VideoNotificationModule } = NativeModules as {
    VideoNotificationModule?: VideoNotificationModule;
};

if (!VideoNotificationModule) {
    console.warn('VideoNotificationModule is not available');
}

const eventEmitter = VideoNotificationModule
    ? new NativeEventEmitter(NativeModules.VideoNotificationModule)
    : null;

/**
 * Servicio para manejar notificaciones nativas de video
 */
const NativeVideoNotification = {
    /**
     * Muestra la notificación con el título y estado del video
     */
    show: (title: string | null | undefined, isPlaying: boolean): void => {
        if (VideoNotificationModule) {
            const safeTitle = title || 'Reproduciendo video';
            VideoNotificationModule.showNotification(safeTitle, isPlaying);
        }
    },

    /**
     * Oculta la notificación
     */
    hide: (): void => {
        if (VideoNotificationModule) {
            VideoNotificationModule.hideNotification();
        }
    },

    /**
     * Actualiza el estado de reproducción en la notificación
     */
    updateState: (isPlaying: boolean): void => {
        if (VideoNotificationModule) {
            VideoNotificationModule.updatePlaybackState(isPlaying);
        }
    },

    /**
     * Escucha el evento de play desde la notificación
     */
    onPlayPressed: (callback: () => void): EmitterSubscription => {
        if (eventEmitter) {
            return eventEmitter.addListener('onPlayPressed', callback);
        }
        return {
            remove: () => { }
        } as EmitterSubscription;
    },

    /**
     * Escucha el evento de pause desde la notificación
     */
    onPausePressed: (callback: () => void): EmitterSubscription => {
        if (eventEmitter) {
            return eventEmitter.addListener('onPausePressed', callback);
        }
        return {
            remove: () => { }
        } as EmitterSubscription;
    },

    /**
     * Escucha el evento de stop desde la notificación
     */
    onStopPressed: (callback: () => void): EmitterSubscription => {
        if (eventEmitter) {
            return eventEmitter.addListener('onStopPressed', callback);
        }
        return {
            remove: () => { }
        } as EmitterSubscription;
    },
};

export default NativeVideoNotification;