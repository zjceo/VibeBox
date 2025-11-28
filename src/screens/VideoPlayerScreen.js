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
} from 'react-native';
import Video from 'react-native-video';
import PlayerControls from '../components/PlayerControls';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { video, playlist = [] } = route.params;
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

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

  // Auto-ocultar controles
  useEffect(() => {
    if (showControls && !paused && !isSeeking) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
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

  const handleSeekStart = () => {
    setIsSeeking(true);
    resetControlsTimeout();
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    resetControlsTimeout();
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

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleError = (err) => {
    console.error('Video error:', err);
    setError('Error al cargar el video');
    setLoading(false);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleEnd = () => {
    if (currentIndex < playlist.length - 1) {
      // Reproducir siguiente video automáticamente
      playNextVideo();
    } else {
      // Si es el último, pausar y mostrar controles
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
      const nextVideo = playlist[nextIndex];
      setCurrentVideo(nextVideo);
      setCurrentIndex(nextIndex);
      setCurrentTime(0);
      setDuration(0);
      setPaused(false);
      setLoading(true);
      resetControlsTimeout();
    }
  };

  const playPreviousVideo = () => {
    if (currentTime > 3) {
      // Si llevamos más de 3 segundos, reiniciar video actual
      handleSeek(0);
    } else if (currentIndex > 0) {
      // Si no, ir al video anterior
      const prevIndex = currentIndex - 1;
      const prevVideo = playlist[prevIndex];
      setCurrentVideo(prevVideo);
      setCurrentIndex(prevIndex);
      setCurrentTime(0);
      setDuration(0);
      setPaused(false);
      setLoading(true);
      resetControlsTimeout();
    }
  };

  const selectVideo = (video, index) => {
    setCurrentVideo(video);
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setPaused(false);
    setLoading(true);
    setShowPlaylist(false);
    resetControlsTimeout();
  };

  const skipTime = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
    resetControlsTimeout();
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentSpeedIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    resetControlsTimeout();
  };

  const goBack = () => {
    if (videoRef.current) {
      videoRef.current.seek(0);
      setPaused(true);
    }
    navigation.goBack();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>{currentVideo.name}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={[styles.errorButton, styles.retryButton]}
              onPress={() => {
                setError(null);
                setLoading(true);
              }}
              activeOpacity={0.7}>
              <Text style={styles.errorButtonText}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={goBack}
              activeOpacity={0.7}>
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
            source={{ uri: currentVideo.uri }}
            style={styles.video}
            paused={paused}
            onProgress={handleProgress}
            onLoad={handleLoad}
            onLoadStart={handleLoadStart}
            onError={handleError}
            onEnd={handleEnd}
            resizeMode="contain"
            controls={false}
            repeat={false}
            rate={playbackRate}
            playInBackground={false}
            playWhenInactive={false}
          />

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
              <Text style={styles.loadingText}>Cargando video...</Text>
            </View>
          )}

          {/* Controls Overlay */}
          {showControls && !loading && (
            <View style={styles.controlsOverlay}>
              {/* Top Bar */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={goBack}
                  activeOpacity={0.7}>
                  <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {currentVideo.name}
                  </Text>
                  {playlist.length > 1 && (
                    <Text style={styles.videoSubtitle}>
                      {currentIndex + 1} de {playlist.length}
                    </Text>
                  )}
                </View>
                {playlist.length > 1 && (
                  <TouchableOpacity
                    style={styles.playlistButton}
                    onPress={() => setShowPlaylist(true)}
                    activeOpacity={0.7}>
                    <Text style={styles.playlistIcon}>☰</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Center Controls */}
              <View style={styles.centerControls}>
                {playlist.length > 1 && currentIndex > 0 && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={playPreviousVideo}
                    activeOpacity={0.7}>
                    <Text style={styles.skipIcon}>⏮</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.centerPlayButton}
                  onPress={handlePlayPause}
                  activeOpacity={0.7}>
                  <Text style={styles.centerPlayIcon}>{paused ? '▶' : '⏸'}</Text>
                </TouchableOpacity>

                {playlist.length > 1 && currentIndex < playlist.length - 1 && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={playNextVideo}
                    activeOpacity={0.7}>
                    <Text style={styles.skipIcon}>⏭</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.speedControl}>
                  <TouchableOpacity
                    style={styles.speedButton}
                    onPress={changePlaybackSpeed}
                    activeOpacity={0.7}>
                    <Text style={styles.speedText}>{playbackRate}x</Text>
                  </TouchableOpacity>
                </View>

                <PlayerControls
                  isPlaying={!paused}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  onSeekStart={handleSeekStart}
                  onSeekEnd={handleSeekEnd}
                  position={currentTime}
                  duration={duration}
                  showSkipButtons={false}
                />
              </View>
            </View>
          )}

          {/* Tap Areas for Seeking (solo cuando controles ocultos) */}
          {!showControls && !loading && (
            <>
              <TouchableOpacity
                style={[styles.tapArea, styles.tapAreaLeft]}
                onPress={() => skipTime(-10)}
                activeOpacity={1}>
                <View style={styles.tapIndicator}>
                  <Text style={styles.tapIcon}>⏪</Text>
                  <Text style={styles.tapText}>10s</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tapArea, styles.tapAreaRight]}
                onPress={() => skipTime(10)}
                activeOpacity={1}>
                <View style={styles.tapIndicator}>
                  <Text style={styles.tapIcon}>⏩</Text>
                  <Text style={styles.tapText}>10s</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Playlist Modal */}
      <Modal
        visible={showPlaylist}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaylist(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.playlistContainer}>
            <View style={styles.playlistHeader}>
              <Text style={styles.playlistTitle}>
                Lista de reproducción ({playlist.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowPlaylist(false)}
                activeOpacity={0.7}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={playlist}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.playlistItem,
                    index === currentIndex && styles.playlistItemActive,
                  ]}
                  onPress={() => selectVideo(item, index)}
                  activeOpacity={0.7}>
                  <View style={styles.playlistItemNumber}>
                    <Text style={[
                      styles.playlistItemNumberText,
                      index === currentIndex && styles.playlistItemActiveText,
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.playlistItemInfo}>
                    <Text
                      style={[
                        styles.playlistItemTitle,
                        index === currentIndex && styles.playlistItemActiveText,
                      ]}
                      numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.playlistItemSubtitle}>
                      {item.extension?.toUpperCase()}
                    </Text>
                  </View>
                  {index === currentIndex && (
                    <Text style={styles.playingIcon}>▶</Text>
                  )}
                </TouchableOpacity>
              )}
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
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  video: {
    width: width,
    height: height,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  videoSubtitle: {
    fontSize: 12,
    color: '#b3b3b3',
    marginTop: 2,
  },
  playlistButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  playlistIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  centerPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29, 185, 84, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerPlayIcon: {
    fontSize: 32,
    color: '#ffffff',
    marginLeft: 2,
  },
  bottomControls: {
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  speedControl: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  speedText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapAreaLeft: {
    left: 0,
  },
  tapAreaRight: {
    right: 0,
  },
  tapIndicator: {
    alignItems: 'center',
    opacity: 0,
  },
  tapIcon: {
    fontSize: 32,
    color: '#ffffff',
  },
  tapText: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 4,
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
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#b3b3b3',
    textAlign: 'center',
    marginBottom: 32,
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
  retryButton: {
    backgroundColor: '#3a3a3a',
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  playlistContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 24,
    color: '#ffffff',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  playlistItemActive: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  playlistItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistItemNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b3b3b3',
  },
  playlistItemInfo: {
    flex: 1,
  },
  playlistItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  playlistItemSubtitle: {
    fontSize: 12,
    color: '#b3b3b3',
  },
  playlistItemActiveText: {
    color: '#1DB954',
  },
  playingIcon: {
    fontSize: 16,
    color: '#1DB954',
    marginLeft: 8,
  },
});

export default VideoPlayerScreen;