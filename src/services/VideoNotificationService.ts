import TrackPlayer, { Capability, State } from 'react-native-track-player';
import type { MediaFile } from '../types';

interface VideoTrack {
    id: string;
    url: string;
    title: string;
    artist: string;
    artwork?: string;
    duration: number;
}

class VideoNotificationService {
    /**
     * Configura la notificación para un video
     */
    async setupNotification(video: MediaFile): Promise<void> {
        try {
            // Asegurarse de que TrackPlayer esté inicializado
            await TrackPlayer.getPlaybackState();

            // Limpiar la cola actual
            await TrackPlayer.reset();

            // Preparar el track
            const track: VideoTrack = {
                id: video.id,
                url: video.path,
                title: video.filename || video.name || video.title || 'Video',
                artist: 'Video',
                artwork: video.thumbnail || video.artwork,
                duration: video.duration || 0,
            };

            // Agregar el video como un "track" para mostrar la notificación
            await TrackPlayer.add(track);

            // Configurar capacidades de la notificación
            await TrackPlayer.updateOptions({
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.Stop,
                ],
                compactCapabilities: [
                    Capability.Play,
                    Capability.Pause,
                ],
                notificationCapabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.Stop,
                ],
            });

            console.log('Video notification setup complete');
        } catch (error) {
            console.error('Error setting up video notification:', error);
        }
    }

    /**
     * Reproduce el video
     */
    async play(): Promise<void> {
        try {
            await TrackPlayer.play();
        } catch (error) {
            console.error('Error playing in notification:', error);
        }
    }

    /**
     * Pausa el video
     */
    async pause(): Promise<void> {
        try {
            await TrackPlayer.pause();
        } catch (error) {
            console.error('Error pausing in notification:', error);
        }
    }

    /**
     * Detiene el video y limpia la notificación
     */
    async stop(): Promise<void> {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
        } catch (error) {
            console.error('Error stopping notification:', error);
        }
    }

    /**
     * Actualiza el progreso en la notificación
     */
    async updateProgress(position: number, duration: number): Promise<void> {
        try {
            await TrackPlayer.seekTo(position);
        } catch (error) {
            // Ignorar errores silenciosamente
        }
    }

    /**
     * Verifica si TrackPlayer está reproduciendo
     */
    async isPlaying(): Promise<boolean> {
        try {
            const state = await TrackPlayer.getPlaybackState();
            return state.state === State.Playing;
        } catch (error) {
            return false;
        }
    }
}

export default new VideoNotificationService();