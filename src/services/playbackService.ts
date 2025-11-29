import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Servicio de reproducción en segundo plano para TrackPlayer
 * Este módulo maneja los eventos de control remoto (notificación, lock screen, etc.)
 * 
 * IMPORTANTE: Debe exportarse como module.exports para que TrackPlayer lo reconozca
 */
module.exports = async function playbackService(): Promise<void> {
    // Play
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        await TrackPlayer.play();
    });

    // Pause
    TrackPlayer.addEventListener(Event.RemotePause, async () => {
        await TrackPlayer.pause();
    });

    // Next
    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        await TrackPlayer.skipToNext();
    });

    // Previous
    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        await TrackPlayer.skipToPrevious();
    });

    // Stop
    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
    });

    // Seek
    TrackPlayer.addEventListener(Event.RemoteSeek, async (event: any) => {
        if (event?.position !== undefined) {
            await TrackPlayer.seekTo(event.position);
        }
    });
};