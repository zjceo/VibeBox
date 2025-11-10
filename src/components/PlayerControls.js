import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const PlayerControls = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  position = 0,
  duration = 0,
  showSkipButtons = true,
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={onSeek}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#404040"
          thumbTintColor="#1DB954"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {showSkipButtons && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPrevious}
            activeOpacity={0.7}>
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.playButton]}
          onPress={onPlayPause}
          activeOpacity={0.7}>
          <Text style={styles.playIcon}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {showSkipButtons && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onNext}
            activeOpacity={0.7}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    color: '#888888',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1DB954',
  },
  controlIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  playIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
});

export default PlayerControls;