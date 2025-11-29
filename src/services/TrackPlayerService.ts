import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Servicio completo de TrackPlayer con manejo de todos los eventos
 * 
 * IMPORTANTE: Debe exportarse como module.exports para que TrackPlayer lo reconozca
 */
module.exports = async function TrackPlayerService(): Promise<void> {
  // Remote Play
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play();
  });

  // Remote Pause
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause();
  });

  // Remote Next
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await TrackPlayer.skipToNext();
  });

  // Remote Previous
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await TrackPlayer.skipToPrevious();
  });

  // Remote Seek
  TrackPlayer.addEventListener(Event.RemoteSeek, async (data: any) => {
    if (data?.position !== undefined) {
      await TrackPlayer.seekTo(data.position);
    }
  });

  // Remote Stop
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  });

  // Playlist ended
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (data: any) => {
    if (data?.track !== null && data?.track !== undefined) {
      console.log('Playlist ended');
    }
  });

  // Playback error
  TrackPlayer.addEventListener(Event.PlaybackError, (error: any) => {
    console.error('Playback error:', error);
  });
};