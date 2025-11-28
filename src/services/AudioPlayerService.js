import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
  State,
} from 'react-native-track-player';

class AudioPlayerService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('TrackPlayer already initialized, skipping...');
      return;
    }

    try {
      // Verificar si ya está inicializado
      const state = await TrackPlayer.getState();

      // Si ya está inicializado, solo actualizar opciones
      if (state !== State.None) {
        console.log('TrackPlayer was already initialized, updating options...');
        await this.updatePlayerOptions();
        this.isInitialized = true;
        return;
      }
    } catch (error) {
      // Si falla getState, significa que no está inicializado
      console.log('TrackPlayer not initialized yet, setting up...');
    }

    try {
      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
      });

      await this.updatePlayerOptions();

      this.isInitialized = true;
      console.log('TrackPlayer initialized successfully');
    } catch (error) {
      // Si el error es que ya está inicializado, no es un problema
      if (error.message?.includes('already been initialized')) {
        console.log('TrackPlayer was already initialized by another instance');
        await this.updatePlayerOptions();
        this.isInitialized = true;
      } else {
        console.error('Error initializing TrackPlayer:', error);
        throw error;
      }
    }
  }

  async updatePlayerOptions() {
    try {
      // Configurar capacidades del reproductor
      await TrackPlayer.updateOptions({
        // Comportamiento cuando la app se cierra
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },

        // Capacidades (botones que aparecen en la notificación)
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
        ],

        // Capacidades compactas (las que aparecen siempre)
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],

        // Configuración de la notificación
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],

        // Iconos personalizados (opcionales - comenta si no los tienes)
        // playIcon: require('../assets/icons/play.png'),
        // pauseIcon: require('../assets/icons/pause.png'),
        // stopIcon: require('../assets/icons/stop.png'),
        // previousIcon: require('../assets/icons/previous.png'),
        // nextIcon: require('../assets/icons/next.png'),
      });
    } catch (error) {
      console.error('Error updating player options:', error);
    }
  }

  async reset() {
    try {
      await TrackPlayer.reset();
    } catch (error) {
      console.error('Error resetting player:', error);
    }
  }

  async addTrack(track) {
    try {
      await TrackPlayer.add({
        id: track.id,
        url: track.uri,
        title: track.name || 'Sin título',
        artist: track.artist || 'Artista desconocido',
        album: track.album || 'Álbum desconocido',
        artwork: track.artwork,
        duration: track.duration || 0,
      });
    } catch (error) {
      console.error('Error adding track:', error);
      throw error;
    }
  }

  async addTracks(tracks) {
    try {
      // Formatear tracks para TrackPlayer
      const formattedTracks = tracks.map(track => ({
        id: track.id,
        url: track.uri,
        title: track.name || 'Sin título',
        artist: track.artist || 'Artista desconocido',
        album: track.album || 'Álbum desconocido',
        artwork: track.artwork,
        duration: track.duration || 0,
      }));

      await TrackPlayer.add(formattedTracks);
    } catch (error) {
      console.error('Error adding tracks:', error);
      throw error;
    }
  }

  async play() {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing:', error);
    }
  }

  async pause() {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }

  async skipToNext() {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  }

  async skipToPrevious() {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to previous:', error);
    }
  }

  async seekTo(position) {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  async getProgress() {
    try {
      return await TrackPlayer.getProgress();
    } catch (error) {
      console.error('Error getting progress:', error);
      return { position: 0, duration: 0, buffered: 0 };
    }
  }

  async getState() {
    try {
      return await TrackPlayer.getState();
    } catch (error) {
      console.error('Error getting state:', error);
      return State.None;
    }
  }

  async setRepeatMode(mode) {
    try {
      await TrackPlayer.setRepeatMode(mode);
    } catch (error) {
      console.error('Error setting repeat mode:', error);
    }
  }

  async getCurrentTrack() {
    try {
      const trackIndex = await TrackPlayer.getActiveTrackIndex();
      if (trackIndex == null) return null;

      const track = await TrackPlayer.getTrack(trackIndex);
      return track;
    } catch (error) {
      console.error('Error getting current track:', error);
      return null;
    }
  }

  async getTrack(trackIndex) {
    try {
      return await TrackPlayer.getTrack(trackIndex);
    } catch (error) {
      console.error('Error getting track:', error);
      return null;
    }
  }

  async getQueue() {
    try {
      return await TrackPlayer.getQueue();
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  }

  async removeUpcomingTracks() {
    try {
      await TrackPlayer.removeUpcomingTracks();
    } catch (error) {
      console.error('Error removing upcoming tracks:', error);
    }
  }
}

export default new AudioPlayerService();