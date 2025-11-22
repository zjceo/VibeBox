import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import PlayerControls from '../components/PlayerControls';
import LoadingScreen from '../components/LoadingScreen';
import AudioPlayerService from '../services/AudioPlayerService';
import TrackPlayer, { Event, State, useTrackPlayerEvents } from 'react-native-track-player';

const AudioPlayerScreen = ({ route, navigation }) => {
  const { track, playlist = [] } = route.params;
  
  const [currentTrack, setCurrentTrack] = useState(track);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'track', 'playlist'
  const [shuffleEnabled, setShuffleEnabled] = useState(false);

  useEffect(() => {
    initializePlayer();
    
    return () => {
      // Cleanup cuando se desmonta el componente
      AudioPlayerService.pause();
    };
  }, []);

  // Evento para actualizar el progreso
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPlaying) {
        const progress = await AudioPlayerService.getProgress();
        setPosition(progress.position);
        setDuration(progress.duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Track Player Events
  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackState) {
      const state = await AudioPlayerService.getState();
      setIsPlaying(state === State.Playing);
    }

    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const trackIndex = await TrackPlayer.getCurrentTrack();
      if (trackIndex != null) {
        const trackObject = await TrackPlayer.getTrack(trackIndex);
        // Buscar el track en el playlist
        const fullTrack = playlist.find(t => t.id === trackObject.id);
        if (fullTrack) {
          setCurrentTrack(fullTrack);
        }
      }
    }
  });

  const initializePlayer = async () => {
    try {
      setLoading(true);
      await AudioPlayerService.initialize();
      await AudioPlayerService.reset();
      
      // Agregar toda la playlist
      await AudioPlayerService.addTracks(playlist);
      
      // Buscar el índice del track actual
      const trackIndex = playlist.findIndex(t => t.id === track.id);
      
      // Saltar al track seleccionado
      if (trackIndex > 0) {
        for (let i = 0; i < trackIndex; i++) {
          await AudioPlayerService.skipToNext();
        }
      }
      
      // Reproducir
      await AudioPlayerService.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error initializing player:', error);
      Alert.alert('Error', 'No se pudo inicializar el reproductor');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await AudioPlayerService.pause();
        setIsPlaying(false);
      } else {
        await AudioPlayerService.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleNext = async () => {
    try {
      await AudioPlayerService.skipToNext();
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      await AudioPlayerService.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to previous:', error);
    }
  };

  const handleSeek = async (value) => {
    try {
      await AudioPlayerService.seekTo(value);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const toggleRepeat = async () => {
    try {
      let newMode;
      if (repeatMode === 'off') {
        newMode = 'track';
        await AudioPlayerService.setRepeatMode(TrackPlayer.REPEAT_TRACK);
      } else if (repeatMode === 'track') {
        newMode = 'playlist';
        await AudioPlayerService.setRepeatMode(TrackPlayer.REPEAT_QUEUE);
      } else {
        newMode = 'off';
        await AudioPlayerService.setRepeatMode(TrackPlayer.REPEAT_OFF);
      }
      setRepeatMode(newMode);
    } catch (error) {
      console.error('Error toggling repeat:', error);
    }
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'off') return '🔁';
    if (repeatMode === 'track') return '🔂';
    return '🔁';
  };

  if (loading) {
    return <LoadingScreen message="Cargando reproductor..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reproduciendo</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <View style={styles.albumArt}>
          <Text style={styles.albumArtIcon}>🎵</Text>
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {currentTrack.name}
        </Text>
        <Text style={styles.trackArtist}>
          Desconocido • {currentTrack.extension}
        </Text>
      </View>

      {/* Player Controls */}
      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        position={position}
        duration={duration}
        showSkipButtons={true}
      />

      {/* Additional Controls */}
      <View style={styles.additionalControls}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleRepeat}
          activeOpacity={0.7}>
          <Text style={[
            styles.iconButtonText,
            repeatMode !== 'off' && styles.activeIcon
          ]}>
            {getRepeatIcon()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShuffleEnabled(!shuffleEnabled)}
          activeOpacity={0.7}>
          <Text style={[
            styles.iconButtonText,
            shuffleEnabled && styles.activeIcon
          ]}>
            🔀
          </Text>
        </TouchableOpacity>
      </View>

      {/* Playlist Info */}
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistText}>
          {playlist.length} canciones en la lista
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  albumArtContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  albumArt: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(29, 185, 84, 0.15)',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  albumArtIcon: {
    fontSize: 120,
    textShadowColor: 'rgba(29, 185, 84, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  trackInfoContainer: {
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.4)',
    marginHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  trackTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  trackArtist: {
    fontSize: 17,
    color: '#b3b3b3',
    textAlign: 'center',
    fontWeight: '600',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 24,
    gap: 80,
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
    marginHorizontal: 40,
    borderRadius: 50,
  },
  iconButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 28,
  },
  iconButtonText: {
    fontSize: 24,
    opacity: 0.5,
  },
  activeIcon: {
    opacity: 1,
    textShadowColor: '#1DB954',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  playlistInfo: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  playlistText: {
    fontSize: 15,
    color: '#9a9a9a',
    fontWeight: '600',
  },
});

export default AudioPlayerScreen;