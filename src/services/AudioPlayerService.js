import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
} from 'react-native-track-player';

class AudioPlayerService {
  isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
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

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing audio player:', error);
    }
  }

  async addTrack(track) {
    try {
      await TrackPlayer.add({
        id: track.id,
        url: track.uri,
        title: track.name,
        artist: 'Desconocido',
        duration: 0,
      });
    } catch (error) {
      console.error('Error adding track:', error);
    }
  }

  async addTracks(tracks) {
    try {
      const formattedTracks = tracks.map(track => ({
        id: track.id,
        url: track.uri,
        title: track.name,
        artist: 'Desconocido',
        duration: 0,
      }));
      await TrackPlayer.add(formattedTracks);
    } catch (error) {
      console.error('Error adding tracks:', error);
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

  async setRepeatMode(mode) {
    try {
      await TrackPlayer.setRepeatMode(mode);
    } catch (error) {
      console.error('Error setting repeat mode:', error);
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

  async getCurrentTrack() {
    try {
      return await TrackPlayer.getCurrentTrack();
    } catch (error) {
      console.error('Error getting current track:', error);
      return null;
    }
  }

  async getProgress() {
    try {
      return await TrackPlayer.getProgress();
    } catch (error) {
      console.error('Error getting progress:', error);
      return { position: 0, duration: 0 };
    }
  }

  async reset() {
    try {
      await TrackPlayer.reset();
    } catch (error) {
      console.error('Error resetting:', error);
    }
  }
}

export default new AudioPlayerService();