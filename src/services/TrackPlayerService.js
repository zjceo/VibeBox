import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  // Este servicio se ejecuta en segundo plano
  
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (data) => {
    TrackPlayer.seekTo(data.position);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  // Evento cuando termina una canción
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (data) => {
    if (data.track !== null) {
      // Aquí puedes manejar el fin de la playlist
      console.log('Playlist ended');
    }
  });

  // Evento de error
  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('Playback error:', error);
  });
};