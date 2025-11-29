import TrackPlayer, { Capability, State } from 'react-native-track-player';

class VideoNotificationService {
    async setupNotification(video) {
        try {
            // Asegurarse de que TrackPlayer esté inicializado
            const state = await TrackPlayer.getPlaybackState();

            // Limpiar la cola actual
            await TrackPlayer.reset();

            // Agregar el video como un "track" para mostrar la notificación
            await TrackPlayer.add({
                id: video.id,
                url: video.uri,
                title: video.name,
                artist: 'Video',
                artwork: undefined, // Podrías agregar una miniatura aquí
                duration: 0, // Se actualizará cuando cargue
            });

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

    async play() {
        try {
            await TrackPlayer.play();
        } catch (error) {
            console.error('Error playing in notification:', error);
        }
    }

    async pause() {
        try {
            await TrackPlayer.pause();
        } catch (error) {
            console.error('Error pausing in notification:', error);
        }
    }

    async stop() {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
        } catch (error) {
            console.error('Error stopping notification:', error);
        }
    }

    async updateProgress(position, duration) {
        try {
            // Actualizar el progreso en la notificación
            await TrackPlayer.seekTo(position);
            // TrackPlayer maneja automáticamente la actualización de la UI
        } catch (error) {
            // Ignorar errores silenciosamente
        }
    }
}

export default new VideoNotificationService();
