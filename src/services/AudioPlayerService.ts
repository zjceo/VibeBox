// src/services/AudioPlayerService.ts
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
  State,
  Track,
  Progress,
} from 'react-native-track-player';

interface AudioTrack {
  id: string;
  uri?: string;
  path?: string;
  name?: string;
  artist?: string;
  album?: string;
  artwork?: string;
  duration?: number;
}

class AudioPlayerService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('TrackPlayer already initialized, skipping...');
      return;
    }

    try {
      const state = await TrackPlayer.getPlaybackState();

      if (state.state !== State.None) {
        console.log('TrackPlayer was already initialized, updating options...');
        await this.updatePlayerOptions();
        this.isInitialized = true;
        return;
      }
    } catch (error) {
      console.log('TrackPlayer not initialized yet, setting up...');
    }

    try {
      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
      });

      await this.updatePlayerOptions();

      this.isInitialized = true;
      console.log('TrackPlayer initialized successfully');
    } catch (error: any) {
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

  private async updatePlayerOptions(): Promise<void> {
    try {
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },

        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
        ],

        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],

        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });
    } catch (error) {
      console.error('Error updating player options:', error);
    }
  }

  async reset(): Promise<void> {
    try {
      await TrackPlayer.reset();
    } catch (error) {
      console.error('Error resetting player:', error);
    }
  }

  async addTrack(track: AudioTrack): Promise<void> {
    try {
      // Determinar la URL correcta (uri o path)
      let url = track.uri || track.path || '';

      // Asegurar prefijo file:// para rutas locales si no lo tienen
      if (url && !url.startsWith('http') && !url.startsWith('file://')) {
        url = `file://${url}`;
      }

      await TrackPlayer.add({
        id: track.id,
        url: url,
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

  async addTracks(tracks: AudioTrack[]): Promise<void> {
    try {
      const formattedTracks: Track[] = tracks.map(track => {
        // Determinar la URL correcta (uri o path)
        let url = track.uri || track.path || '';

        // Asegurar prefijo file:// para rutas locales si no lo tienen
        if (url && !url.startsWith('http') && !url.startsWith('file://')) {
          url = `file://${url}`;
        }

        return {
          id: track.id,
          url: url,
          title: track.name || 'Sin título',
          artist: track.artist || 'Artista desconocido',
          album: track.album || 'Álbum desconocido',
          artwork: track.artwork,
          duration: track.duration || 0,
        };
      });

      await TrackPlayer.add(formattedTracks);
    } catch (error) {
      console.error('Error adding tracks:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing:', error);
    }
  }

  async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }

  async skipToNext(): Promise<void> {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  }

  async skipToPrevious(): Promise<void> {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to previous:', error);
    }
  }

  async seekTo(position: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  async getProgress(): Promise<Progress> {
    try {
      return await TrackPlayer.getProgress();
    } catch (error) {
      console.error('Error getting progress:', error);
      return { position: 0, duration: 0, buffered: 0 };
    }
  }

  async getState(): Promise<State> {
    try {
      const state = await TrackPlayer.getPlaybackState();
      return state.state;
    } catch (error) {
      console.error('Error getting state:', error);
      return State.None;
    }
  }

  async setRepeatMode(mode: RepeatMode): Promise<void> {
    try {
      await TrackPlayer.setRepeatMode(mode);
    } catch (error) {
      console.error('Error setting repeat mode:', error);
    }
  }

  async getCurrentTrack(): Promise<Track | null> {
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

  async getTrack(trackIndex: number): Promise<Track | null> {
    try {
      return await TrackPlayer.getTrack(trackIndex);
    } catch (error) {
      console.error('Error getting track:', error);
      return null;
    }
  }

  async getQueue(): Promise<Track[]> {
    try {
      return await TrackPlayer.getQueue();
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  }

  async removeUpcomingTracks(): Promise<void> {
    try {
      await TrackPlayer.removeUpcomingTracks();
    } catch (error) {
      console.error('Error removing upcoming tracks:', error);
    }
  }
}

export default new AudioPlayerService();