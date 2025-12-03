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
  const doubleTapTimeoutRef = useRef(null);
  const skipAnimLeft = useRef(new Animated.Value(0)).current;
  const skipAnimRight = useRef(new Animated.Value(0)).current;

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
  const [isBuffering, setIsBuffering] = useState(false);

  // Auto-ocultar controles
  useEffect(() => {
    if (showControls && !paused && !isSeeking && !isBuffering) {
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
  }, [showControls, paused, isSeeking, isBuffering]);

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
      resetControlsTimeout();
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
    setIsBuffering(false);
    setPaused(false);
  };

  const handleError = (err) => {
    console.error('Video error:', err);
    setError(`Error al cargar el video`);
    setLoading(false);
    setIsBuffering(false);
  };

  const handleBuffer = (data) => {
    setIsBuffering(data.isBuffering);
    if (data.isBuffering) {
      setShowControls(true);
    }
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
        setCurrentTime(0);
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
      setShowControls(true);
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
      setShowControls(true);
    }
  };

  const selectVideo = (item, index) => {
    setCurrentVideo(item);
    setCurrentIndex(index);
    setCurrentTime(0);
    setPaused(false);
    setLoading(true);
    setShowPlaylist(false);
    setShowControls(true);
  };

  const skipTime = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);

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

    resetControlsTimeout();
  };

  const handleDoubleTap = (side) => {
    if (doubleTapTimeoutRef.current) {
      clearTimeout(doubleTapTimeoutRef.current);
      doubleTapTimeoutRef.current = null;
      skipTime(side === 'left' ? -10 : 10);
    } else {
      doubleTapTimeoutRef.current = setTimeout(() => {
        doubleTapTimeoutRef.current = null;
        toggleControls();
      }, 300);
    }
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentSpeedIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    resetControlsTimeout();
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoName = (video) => {
    if (!video) return 'Video sin nombre';
    const name = video.filename || video.name || video.title;
    if (name && name.trim()) return name;
    if (video.path) {
      const pathParts = video.path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      return nameWithoutExt || 'Video sin nombre';
    }
    return 'Video sin nombre';
  };

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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>{getVideoName(currentVideo)}</Text>
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

      <View style={styles.videoContainer}>
        {/* Video */}
        <Video
          ref={videoRef}
          source={{ uri: currentVideo.path }}
          style={styles.video}
          paused={paused}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onError={handleError}
          onEnd={handleEnd}
          onBuffer={handleBuffer}
          resizeMode="contain"
          rate={playbackRate}
          controls={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          progressUpdateInterval={250}
          volume={1.0}
        />

        {/* Loading */}
        {(loading || isBuffering) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF0000" />
            <Text style={styles.loadingText}>
              {isBuffering ? 'Buffering...' : 'Cargando...'}
            </Text>
          </View>
        )}

        {/* Tap Zones */}
        <View style={styles.tapZonesContainer} pointerEvents={showControls ? 'none' : 'box-none'}>
          <TouchableWithoutFeedback onPress={() => handleDoubleTap('left')}>
            <View style={styles.tapZoneLeft}>
              <Animated.View style={[styles.skipFeedback, { opacity: skipAnimLeft }]}>
                <Text style={styles.skipFeedbackIcon}>⏪</Text>
                <Text style={styles.skipFeedbackText}>10 seg</Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={toggleControls}>
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

        {/* Controls */}
        {showControls && !loading && (
          <Animated.View
            style={[styles.controlsContainer, { opacity: fadeAnim }]}
            pointerEvents="box-none">

            {/* Top Bar con fondo oscuro */}
            <View style={styles.topBarContainer}>
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.iconText}>←</Text>
                </TouchableOpacity>

                <View style={styles.titleArea}>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {getVideoName(currentVideo)}
                  </Text>
                  {playlist.length > 1 && (
                    <Text style={styles.videoSubtitle}>
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
                    <Text style={styles.iconText}>☰</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Center Play Button - SIN FONDO */}
            <View style={styles.centerArea}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                activeOpacity={0.8}>
                <Text style={styles.playIcon}>{paused ? '▶' : '⏸'}</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar con fondo oscuro */}
            <View style={styles.bottomBarContainer}>
              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration || 1}
                  value={currentTime}
                  onValueChange={(value) => {
                    setIsSeeking(true);
                    setCurrentTime(value);
                  }}
                  onSlidingComplete={(value) => {
                    setIsSeeking(false);
                    handleSeek(value);
                  }}
                  minimumTrackTintColor="#FF0000"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#FF0000"
                />
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomBar}>
                <View style={styles.leftControls}>
                  <TouchableOpacity onPress={handlePlayPause}>
                    <Text style={styles.controlIcon}>{paused ? '▶' : '⏸'}</Text>
                  </TouchableOpacity>

                  {playlist.length > 1 && currentIndex > 0 && (
                    <TouchableOpacity onPress={playPreviousVideo}>
                      <Text style={styles.controlIcon}>⏮</Text>
                    </TouchableOpacity>
                  )}

                  {playlist.length > 1 && currentIndex < playlist.length - 1 && (
                    <TouchableOpacity onPress={playNextVideo}>
                      <Text style={styles.controlIcon}>⏭</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.timeDisplay}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </View>

                <View style={styles.rightControls}>
                  <TouchableOpacity onPress={changePlaybackSpeed}>
                    <Text style={styles.settingsIcon}>⚙</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Playlist Modal */}
      <Modal
        visible={showPlaylist}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPlaylist(false);
          setSearchQuery('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.playlistModal}>
            <View style={styles.playlistHeader}>
              <View>
                <Text style={styles.playlistTitle}>Lista de reproducción</Text>
                <Text style={styles.playlistCount}>
                  {filteredPlaylist.length} videos
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowPlaylist(false);
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
                  placeholder="Buscar..."
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
                const itemIndex = playlist.findIndex(v => v.id === item.id);
                const isActive = itemIndex === currentIndex;
                return (
                  <TouchableOpacity
                    style={[styles.playlistItem, isActive && styles.activeItem]}
                    onPress={() => selectVideo(item, itemIndex)}>
                    <Text style={[styles.itemNumber, isActive && styles.activeNumber]}>
                      {itemIndex + 1}
                    </Text>
                    <Text style={[styles.itemTitle, isActive && styles.activeTitle]} numberOfLines={2}>
                      {getVideoName(item)}
                    </Text>
                    {isActive && <View style={styles.playingDot} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>No hay videos</Text>
                </View>
              }
            />
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },

  // TAP ZONES
  tapZonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  tapZoneLeft: {
    width: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapZoneCenter: {
    flex: 1,
  },
  tapZoneRight: {
    width: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipFeedback: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipFeedbackIcon: {
    fontSize: 36,
    color: '#fff',
  },
  skipFeedbackText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
  },

  // CONTROLS
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  // TOP BAR
  topBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 12,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  speedText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  titleArea: {
    flex: 1,
    marginHorizontal: 8,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  videoSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // CENTER
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  playIcon: {
    fontSize: 30,
    color: '#fff',
  },

  // BOTTOM BAR
  bottomBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 8,
    paddingBottom: 16,
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlIcon: {
    fontSize: 22,
    color: '#fff',
  },
  settingsIcon: {
    fontSize: 22,
    color: '#fff',
  },
  timeDisplay: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },

  // ERROR
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  errorButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
  },
  backErrorButton: {
    backgroundColor: '#444',
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // MODAL
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
    fontSize: 15,
    color: '#fff',
  },
  clearText: {
    fontSize: 16,
    color: '#888',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activeItem: {
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  itemNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    width: 32,
  },
  activeNumber: {
    color: '#FF0000',
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  activeTitle: {
    color: '#FF0000',
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default VideoPlayerScreen;