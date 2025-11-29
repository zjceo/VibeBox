import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import PlayerControls from '../components/PlayerControls';
import LoadingScreen from '../components/LoadingScreen';
import AudioPlayerService from '../services/AudioPlayerService';
import FavoritesService from '../services/FavoritesService';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import TrackPlayer, { Event, State, RepeatMode, useTrackPlayerEvents } from 'react-native-track-player';

const { width } = Dimensions.get('window');

const AudioPlayerScreen = ({ route, navigation }) => {
  const { track, playlist = [] } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(track);
  const [loading, setLoading] = useState(true);
  const [repeatMode, setRepeatMode] = useState('off');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    initializePlayer();
    checkFavoriteStatus();
  }, []);

  useEffect(() => {
    checkFavoriteStatus();
  }, [currentTrack]);

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackProgress, Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackState) {
      setIsPlaying(event.state === State.Playing);
    }
    if (event.type === Event.PlaybackProgress) {
      setPosition(event.position);
      setDuration(event.duration);
    }
    if (event.type === Event.PlaybackTrackChanged) {
      if (event.nextTrack !== undefined) {
        const trackId = await TrackPlayer.getTrack(event.nextTrack);
        // Find full track info from playlist
        const fullTrack = playlist.find(t => t.id === trackId?.id) || trackId;
        if (fullTrack) {
          setCurrentTrack(fullTrack);
          const index = playlist.findIndex(t => t.id === fullTrack.id);
          setCurrentIndex(index !== -1 ? index : 0);
        }
      }
    }
  });

  const initializePlayer = async () => {
    try {
      setLoading(true);

      // Inicializar solo si es necesario
      await AudioPlayerService.initialize();
      await AudioPlayerService.reset();

      // Agregar toda la playlist
      await AudioPlayerService.addTracks(playlist);

      // Buscar el índice del track actual
      const trackIndex = playlist.findIndex(t => t.id === track.id);
      setCurrentIndex(trackIndex);

      // Saltar al track si no es el primero
      if (trackIndex > 0) {
        await TrackPlayer.skip(trackIndex);
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
      } else {
        await AudioPlayerService.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleNext = async () => {
    try {
      const queue = await AudioPlayerService.getQueue();
      if (currentIndex < queue.length - 1) {
        await AudioPlayerService.skipToNext();
      } else if (repeatMode === 'playlist') {
        await TrackPlayer.skip(0);
        await AudioPlayerService.play();
      }
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      if (position > 3) {
        // Si llevamos más de 3 segundos, reiniciar la canción
        await AudioPlayerService.seekTo(0);
      } else {
        // Si no, ir a la anterior
        await AudioPlayerService.skipToPrevious();
      }
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
        await AudioPlayerService.setRepeatMode(RepeatMode.Track);
      } else if (repeatMode === 'track') {
        newMode = 'playlist';
        await AudioPlayerService.setRepeatMode(RepeatMode.Queue);
      } else {
        newMode = 'off';
        await AudioPlayerService.setRepeatMode(RepeatMode.Off);
      }
      setRepeatMode(newMode);
    } catch (error) {
      console.error('Error toggling repeat:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (currentTrack?.id) {
      const fav = await FavoritesService.isFavorite(currentTrack.id);
      setIsFavorite(fav);
    }
  };

  const toggleFavorite = async () => {
    if (currentTrack?.id) {
      const newStatus = await FavoritesService.toggle(currentTrack.id);
      setIsFavorite(newStatus);
    }
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'off') return 'repeat';
    if (repeatMode === 'track') return 'repeat-1';
    return 'repeat';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <Text style={styles.headerTitle}>Reproduciendo ahora</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
          activeOpacity={0.7}>
          <Text style={styles.favoriteIcon}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
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
          {currentTrack.extension?.toUpperCase()} • {playlist.length} canciones
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
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
      </View>

      {/* Additional Controls */}
      <View style={styles.additionalControls}>
        <TouchableOpacity
          style={[styles.iconButton, repeatMode !== 'off' && styles.iconButtonActive]}
          onPress={toggleRepeat}
          activeOpacity={0.7}>
          <Text style={styles.iconText}>
            {repeatMode === 'off' ? '🔁' : repeatMode === 'track' ? '🔂' : '🔁'}
          </Text>
        </TouchableOpacity>

        <View style={styles.trackCounter}>
          <Text style={styles.trackCounterText}>
            {currentIndex + 1} / {playlist.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowPlaylistModal(true)}
          activeOpacity={0.7}>
          <Text style={styles.iconText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <AddToPlaylistModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        track={currentTrack}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  albumArtContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  albumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  albumArtIcon: {
    fontSize: 100,
    opacity: 0.3,
  },
  trackInfoContainer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 14,
    color: '#b3b3b3',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
  },
  iconButtonActive: {
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
  },
  iconText: {
    fontSize: 20,
    color: '#b3b3b3',
  },
  trackCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  trackCounterText: {
    fontSize: 13,
    color: '#b3b3b3',
    fontWeight: '600',
  },
});

export default AudioPlayerScreen;