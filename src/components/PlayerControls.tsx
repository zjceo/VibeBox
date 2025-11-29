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

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (value: number) => void;
  position?: number;
  duration?: number;
  showSkipButtons?: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  position = 0,
  duration = 0,
  showSkipButtons = true,
}) => {
  const formatTime = (seconds: number): string => {
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
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  progressContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  slider: {
    width: '100%',
    height: 44,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  timeText: {
    color: '#b3b3b3',
    fontSize: 13,
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 36,
    paddingVertical: 8,
  },
  controlButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  playButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#1DB954',
    borderWidth: 3,
    borderColor: 'rgba(29, 185, 84, 0.3)',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  controlIcon: {
    fontSize: 26,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  playIcon: {
    fontSize: 32,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default PlayerControls;