import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  FlatList,
  Modal,
  Animated,
  TextInput,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { video, playlist = [] } = route.params;
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [currentVideo, setCurrentVideo] = useState(video);
  const [currentIndex, setCurrentIndex] = useState(
    playlist.findIndex(v => v.id === video.id) || 0
  );
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaylist, setFilteredPlaylist] = useState(playlist);

  // Auto-ocultar controles con animación
  useEffect(() => {
    if (showControls && !paused && !isSeeking) {
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
      }, 4000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, paused, isSeeking]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
  };

  const handlePlayPause = () => {
    setPaused(!paused);
    resetControlsTimeout();
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
      setCurrentTime(value);
    }
  };

  const handleProgress = (data) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
    setLoading(false);
    setError(null);
  };

  const handleError = (err) => {
    console.error('Video error:', err);
    console.error('Current video path:', currentVideo.path);
    setError('Error al cargar el video');
    setLoading(false);
  };

  const toggleControls = () => {
    if (!showControls) {
      setShowControls(true);
      resetControlsTimeout();
    }
  };

  const handleEnd = () => {
    if (currentIndex < playlist.length - 1) {
      playNextVideo();
    } else {
      setPaused(true);
      setShowControls(true);
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    }
  };

  const playNextVideo = () => {
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentVideo(playlist[nextIndex]);
      setCurrentIndex(nextIndex);
      setCurrentTime(0);
      setPaused(false);
      setLoading(true);
    }
  };

  const playPreviousVideo = () => {
    if (currentTime > 3) {
      handleSeek(0);
    } else if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentVideo(playlist[prevIndex]);
      setCurrentIndex(prevIndex);
      setCurrentTime(0);
      setPaused(false);
      setLoading(true);
    }
  };

  const selectVideo = (item, index) => {
    setCurrentVideo(item);
    setCurrentIndex(index);
    setCurrentTime(0);
    setPaused(false);
    setLoading(true);
    setShowPlaylist(false);
  };

  const skipTime = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentSpeedIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper para obtener el nombre del video
  const getVideoName = (video) => {
    if (!video) return 'Video sin nombre';

    // Intentar obtener el nombre de varias propiedades
    const name = video.filename || video.name || video.title;

    if (name && name.trim()) {
      return name;
    }

    // Si no hay nombre, intentar extraer del path
    if (video.path) {
      const pathParts = video.path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      // Remover extensión
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      return nameWithoutExt || 'Video sin nombre';
    }

    return 'Video sin nombre';
  };

  // Filtrar playlist según búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlaylist(playlist);
    } else {
      const filtered = playlist.filter(item => {
        const name = getVideoName(item).toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      });
      setFilteredPlaylist(filtered);
    }
  }, [searchQuery, playlist]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>{getVideoName(currentVideo)}</Text>
          <Text style={styles.errorPath}>Ruta: {currentVideo.path}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => {
                setError(null);
                setLoading(true);
              }}>
              <Text style={styles.errorButtonText}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.errorButton, styles.backErrorButton]}
              onPress={() => navigation.goBack()}>
              <Text style={styles.errorButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: currentVideo.path }}
            style={styles.video}
            paused={paused}
            onProgress={handleProgress}
            onLoad={handleLoad}
            onError={handleError}
            onEnd={handleEnd}
            resizeMode="contain"
            rate={playbackRate}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
              <Text style={styles.loadingText}>Cargando...</Text>
              <Text style={styles.loadingSubtext}>{getVideoName(currentVideo)}</Text>
            </View>
          )}

          {showControls && !loading && (
            <Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
              {/* Top Bar */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.icon}>←</Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={styles.title} numberOfLines={1}>
                    {getVideoName(currentVideo)}
                  </Text>
                  {playlist.length > 1 && (
                    <Text style={styles.subtitle}>
                      {currentIndex + 1} / {playlist.length}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={changePlaybackSpeed}>
                  <Text style={styles.speedText}>{playbackRate}x</Text>
                </TouchableOpacity>
                {playlist.length > 1 && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowPlaylist(true)}>
                    <Text style={styles.icon}>☰</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Center Play Button */}
              <View style={styles.centerControls}>
                {currentIndex > 0 && (
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={playPreviousVideo}>
                    <Text style={styles.controlIcon}>⏮</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.mainPlayButton}
                  onPress={handlePlayPause}>
                  <Text style={styles.mainPlayIcon}>
                    {paused ? '▶' : '⏸'}
                  </Text>
                </TouchableOpacity>
                {currentIndex < playlist.length - 1 && (
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={playNextVideo}>
                    <Text style={styles.controlIcon}>⏭</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomBar}>
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={currentTime}
                    onValueChange={(value) => {
                      setIsSeeking(true);
                      setCurrentTime(value);
                    }}
                    onSlidingComplete={(value) => {
                      setIsSeeking(false);
                      handleSeek(value);
                    }}
                    minimumTrackTintColor="#1DB954"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#1DB954"
                  />
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Tap Zones para Skip */}
          {!showControls && !loading && (
            <>
              <TouchableOpacity
                style={[styles.tapZone, styles.tapZoneLeft]}
                onPress={() => skipTime(-10)}
                activeOpacity={0.9}>
                <View style={styles.skipIndicator}>
                  <Text style={styles.skipIcon}>⏪</Text>
                  <Text style={styles.skipText}>-10s</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tapZone, styles.tapZoneRight]}
                onPress={() => skipTime(10)}
                activeOpacity={0.9}>
                <View style={styles.skipIndicator}>
                  <Text style={styles.skipIcon}>⏩</Text>
                  <Text style={styles.skipText}>+10s</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Playlist Modal */}
      <Modal
        visible={showPlaylist}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlaylist(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.playlistContainer}>
            <View style={styles.playlistHeader}>
              <View>
                <Text style={styles.playlistTitle}>
                  Lista de reproducción
                </Text>
                <Text style={styles.playlistSubtitle}>
                  {filteredPlaylist.length} de {playlist.length} videos
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButtonContainer}
                onPress={() => {
                  setShowPlaylist(false);
                  setSearchQuery('');
                }}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Buscador */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar video..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={clearSearch}
                    style={styles.clearButton}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              {searchQuery.length > 0 && (
                <Text style={styles.searchResults}>
                  {filteredPlaylist.length} resultado{filteredPlaylist.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>

            {/* Lista de videos */}
            {filteredPlaylist.length > 0 ? (
              <FlatList
                data={filteredPlaylist}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const itemIndex = playlist.findIndex(v => v.id === item.id);
                  const isActive = itemIndex === currentIndex;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.playlistItem,
                        isActive && styles.playlistItemActive,
                      ]}
                      onPress={() => selectVideo(item, itemIndex)}>
                      <View style={styles.playlistItemLeft}>
                        <Text style={[
                          styles.playlistNumber,
                          isActive && styles.activeText,
                        ]}>
                          {itemIndex + 1}
                        </Text>
                      </View>
                      <View style={styles.playlistItemCenter}>
                        <Text
                          style={[
                            styles.playlistItemTitle,
                            isActive && styles.activeText,
                          ]}
                          numberOfLines={2}>
                          {getVideoName(item)}
                        </Text>
                        <Text style={styles.playlistItemSubtitle}>
                          {item.type?.toUpperCase() || 'VIDEO'}
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
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsText}>
                  No se encontraron videos
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Intenta con otro término de búsqueda
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width,
    height,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: '#888',
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#fff',
  },
  speedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#b3b3b3',
    marginTop: 2,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
    color: '#fff',
  },
  mainPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  mainPlayIcon: {
    fontSize: 32,
    color: '#fff',
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'center',
  },
  tapZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapZoneLeft: {
    left: 0,
  },
  tapZoneRight: {
    right: 0,
  },
  skipIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    borderRadius: 12,
  },
  skipIcon: {
    fontSize: 28,
    color: '#fff',
  },
  skipText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#b3b3b3',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorPath: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  errorButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  backErrorButton: {
    backgroundColor: '#333',
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  playlistContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playlistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  playlistSubtitle: {
    fontSize: 13,
    color: '#b3b3b3',
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 14,
    color: '#888',
  },
  searchResults: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontWeight: '500',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playlistItemActive: {
    backgroundColor: 'rgba(29,185,84,0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  playlistItemLeft: {
    width: 40,
    alignItems: 'center',
  },
  playlistNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  playlistItemCenter: {
    flex: 1,
    marginLeft: 12,
  },
  playlistItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playlistItemSubtitle: {
    fontSize: 13,
    color: '#b3b3b3',
  },
  activeText: {
    color: '#1DB954',
  },
  playingIndicator: {
    marginLeft: 8,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1DB954',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.3,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 13,
    color: '#888',
  },
});

export default VideoPlayerScreen;