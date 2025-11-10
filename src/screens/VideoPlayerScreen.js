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
} from 'react-native';
import Video from 'react-native-video';
import { PlayerControls } from '../components';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const videoRef = useRef(null);
  
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(null);

  // Auto-ocultar controles
  useEffect(() => {
    let timeout;
    if (showControls && !paused) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, paused]);

  const handlePlayPause = () => {
    setPaused(!paused);
    if (paused) {
      setShowControls(true);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
      setCurrentTime(value);
    }
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
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
    setPaused(true);
    setShowControls(true);
    // Reiniciar el video
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
  };

  const goBack = () => {
    if (videoRef.current) {
      videoRef.current.seek(0);
      setPaused(true);
    }
    navigation.goBack();
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={goBack}
            activeOpacity={0.7}>
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
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
            source={{ uri: video.uri }}
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
                    {video.name}
                  </Text>
                </View>
                <View style={styles.placeholder} />
              </View>

              {/* Center Play Button */}
              {paused && (
                <TouchableOpacity
                  style={styles.centerPlayButton}
                  onPress={handlePlayPause}
                  activeOpacity={0.7}>
                  <Text style={styles.centerPlayIcon}>▶</Text>
                </TouchableOpacity>
              )}

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <PlayerControls
                  isPlaying={!paused}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  position={currentTime}
                  duration={duration}
                  showSkipButtons={false}
                />
              </View>
            </View>
          )}

          {/* Tap Areas for Seeking */}
          {!showControls && (
            <>
              <TouchableOpacity
                style={[styles.tapArea, styles.tapAreaLeft]}
                onPress={() => handleSeek(Math.max(0, currentTime - 10))}
                activeOpacity={1}
              />
              <TouchableOpacity
                style={[styles.tapArea, styles.tapAreaRight]}
                onPress={() => handleSeek(Math.min(duration, currentTime + 10))}
                activeOpacity={1}
              />
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29, 185, 84, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerPlayIcon: {
    fontSize: 32,
    color: '#ffffff',
    marginLeft: 4,
  },
  bottomControls: {
    paddingBottom: 20,
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
  },
  tapAreaLeft: {
    left: 0,
  },
  tapAreaRight: {
    right: 0,
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
    marginBottom: 32,
  },
  errorButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default VideoPlayerScreen;