import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  Modal,
  FlatList,
  TextInput,
  BackHandler,
} from 'react-native';
import Slider from '@react-native-community/slider';
import LoadingScreen from '../../components/ui/LoadingScreen';
import AudioPlayerService from '../../services/AudioPlayerService';
import FavoritesService from '../../services/FavoritesService';
import AddToPlaylistModal from '../../components/playlists/AddToPlaylistModal';
import TrackPlayer, { Event, State, RepeatMode, useTrackPlayerEvents, useProgress } from 'react-native-track-player';
import { AudioPlayerScreenProps } from '../types';

const { width } = Dimensions.get('window');

type RepeatModeType = 'off' | 'track' | 'playlist';

const AudioPlayerScreen: React.FC<AudioPlayerScreenProps> = ({ route, navigation }) => {
  const { track, playlist = [] } = route.params;
  
  // Estados principales
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(track);
  const [loading, setLoading] = useState(true);
  const [repeatMode, setRepeatMode] = useState<RepeatModeType>('off');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  
  // Estados de UI mejorados
  const [showControls, setShowControls] = useState(true);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaylist, setFilteredPlaylist] = useState(playlist);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const skipAnimLeft = useRef(new Animated.Value(0)).current;
  const skipAnimRight = useRef(new Animated.Value(0)).current;
  const favoriteAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Progress hook
  const progress = useProgress();

  // Auto-ocultar controles
  useEffect(() => {
    if (showControls && isPlaying && !isSeeking) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      controlsTimeoutRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 5000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying, isSeeking]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!showControls) {
      setShowControls(true);
    }
  };

  // Inicialización
  useEffect(() => {
    initializePlayer();
    checkFavoriteStatus();
  }, []);

  useEffect(() => {
    checkFavoriteStatus();
  }, [currentTrack]);

  // Handle Android Back Button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Filtrar playlist por búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlaylist(playlist);
    } else {
      const filtered = playlist.filter(item => {
        const name = (item.name || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      });
      setFilteredPlaylist(filtered);
    }
  }, [searchQuery, playlist]);

  // Update position and duration from progress hook
  useEffect(() => {
    if (!isSeeking) {
      setPosition(progress.position);
      setDuration(progress.duration);
    }
  }, [progress.position, progress.duration, isSeeking]);

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackState) {
      setIsPlaying(event.state === State.Playing);
    }
    if (event.type === Event.PlaybackTrackChanged) {
      if (event.nextTrack !== undefined) {
        const trackId = await TrackPlayer.getTrack(event.nextTrack);
        const fullTrack = playlist.find(t => t.id === trackId?.id);
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
      await AudioPlayerService.initialize();
      await AudioPlayerService.reset();
      await AudioPlayerService.addTracks(playlist);

      const trackIndex = playlist.findIndex(t => t.id === track.id);
      setCurrentIndex(trackIndex);

      if (trackIndex > 0) {
        await TrackPlayer.skip(trackIndex);
      }

      await AudioPlayerService.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error initializing player:', error);
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
      resetControlsTimeout();
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
      resetControlsTimeout();
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      if (position > 3) {
        await AudioPlayerService.seekTo(0);
      } else {
        await AudioPlayerService.skipToPrevious();
      }
      resetControlsTimeout();
    } catch (error) {
      console.error('Error skipping to previous:', error);
    }
  };

  const handleSeek = async (value: number) => {
    try {
      await AudioPlayerService.seekTo(value);
      setPosition(value);
      resetControlsTimeout();
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const skipTime = async (seconds: number) => {
    const newPosition = Math.max(0, Math.min(duration, position + seconds));
    await handleSeek(newPosition);

    const anim = seconds > 0 ? skipAnimRight : skipAnimLeft;
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDoubleTap = (side: 'left' | 'right') => {
    if (doubleTapTimeoutRef.current) {
      clearTimeout(doubleTapTimeoutRef.current);
      doubleTapTimeoutRef.current = null;
      skipTime(side === 'left' ? -10 : 10);
    } else {
      doubleTapTimeoutRef.current = setTimeout(() => {
        doubleTapTimeoutRef.current = null;
        resetControlsTimeout();
      }, 300);
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
      resetControlsTimeout();
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
      
      Animated.sequence([
        Animated.timing(favoriteAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(favoriteAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      resetControlsTimeout();
    }
  };

  const selectTrack = async (item: any, index: number) => {
    try {
      await TrackPlayer.skip(index);
      await AudioPlayerService.play();
      setCurrentTrack(item);
      setCurrentIndex(index);
      setShowPlaylistModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error selecting track:', error);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
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

      {/* Tap Zones para doble tap */}
      <View style={styles.tapZonesContainer} pointerEvents={showControls ? 'none' : 'box-none'}>
        <TouchableWithoutFeedback onPress={() => handleDoubleTap('left')}>
          <View style={styles.tapZoneLeft}>
            <Animated.View style={[styles.skipFeedback, { opacity: skipAnimLeft }]}>
              <Text style={styles.skipFeedbackIcon}>⏪</Text>
              <Text style={styles.skipFeedbackText}>10 seg</Text>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={resetControlsTimeout}>
          <View style={styles.tapZoneCenter} />
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => handleDoubleTap('right')}>
          <View style={styles.tapZoneRight}>
            <Animated.View style={[styles.skipFeedback, { opacity: skipAnimRight }]}>
              <Text style={styles.skipFeedbackIcon}>⏩</Text>
              <Text style={styles.skipFeedbackText}>10 seg</Text>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </View>

      {/* Controles animados */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>REPRODUCIENDO AHORA</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            activeOpacity={0.7}>
            <Animated.Text style={[styles.favoriteIcon, { transform: [{ scale: favoriteAnim }] }]}>
              {isFavorite ? '❤️' : '🤍'}
            </Animated.Text>
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

        {/* Progress Bar con controles integrados */}
        <View style={styles.progressContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onValueChange={(value) => {
              setIsSeeking(true);
              setPosition(value);
            }}
            onSlidingComplete={(value) => {
              setIsSeeking(false);
              handleSeek(value);
            }}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#1DB954"
          />
        </View>

        {/* Controles de reproducción */}
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePrevious}
            activeOpacity={0.7}>
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            activeOpacity={0.8}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleNext}
            activeOpacity={0.7}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
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
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowAddToPlaylistModal(true)}
            activeOpacity={0.7}>
            <Text style={styles.iconText}>⋮</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modal de Playlist con búsqueda */}
      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPlaylistModal(false);
          setSearchQuery('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.playlistModal}>
            <View style={styles.playlistHeader}>
              <View>
                <Text style={styles.playlistTitle}>Lista de reproducción</Text>
                <Text style={styles.playlistCount}>
                  {filteredPlaylist.length} canciones
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowPlaylistModal(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <View style={styles.searchInput}>
                <Text style={styles.searchIconText}>🔍</Text>
                <TextInput
                  style={styles.searchField}
                  placeholder="Buscar canción..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <FlatList
              data={filteredPlaylist}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const itemIndex = playlist.findIndex(t => t.id === item.id);
                const isActive = itemIndex === currentIndex;
                return (
                  <TouchableOpacity
                    style={[styles.playlistItem, isActive && styles.activeItem]}
                    onPress={() => selectTrack(item, itemIndex)}>
                    <Text style={[styles.itemNumber, isActive && styles.activeNumber]}>
                      {itemIndex + 1}
                    </Text>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, isActive && styles.activeTitle]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemArtist}>
                        {item.extension?.toUpperCase()}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={styles.playingIndicator}>
                        <View style={styles.playingDot} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>No hay canciones</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      <AddToPlaylistModal
        visible={showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(false)}
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
  contentContainer: {
    flex: 1,
  },
  tapZonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  tapZoneLeft: {
    width: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapZoneCenter: {
    flex: 1,
  },
  tapZoneRight: {
    width: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipFeedback: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipFeedbackIcon: {
    fontSize: 32,
    color: '#fff',
  },
  skipFeedbackText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1.5,
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
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#b3b3b3',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingVertical: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 32,
    color: '#ffffff',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playIcon: {
    fontSize: 36,
    color: '#ffffff',
    marginLeft: 2,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  playlistModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  playlistCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#fff',
  },
  searchBox: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIconText: {
    fontSize: 16,
    marginRight: 8,
  },
  searchField: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 0,
  },
  clearText: {
    fontSize: 18,
    color: '#888',
    marginLeft: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activeItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  itemNumber: {
    width: 30,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginRight: 12,
  },
  activeNumber: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  activeTitle: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  itemArtist: {
    fontSize: 12,
    color: '#888',
  },
  playingIndicator: {
    marginLeft: 12,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1DB954',
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default AudioPlayerScreen;