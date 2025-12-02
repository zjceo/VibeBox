import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import TrackPlayer, {
    useTrackPlayerEvents,
    Event,
    State,
    usePlaybackState,
    useProgress,
    Track,
} from 'react-native-track-player';

const { width } = Dimensions.get('window');

interface MiniPlayerProps {
    onPress: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const playbackState = usePlaybackState();
    const progress = useProgress();
    const [slideAnim] = useState(new Animated.Value(100));

    useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
        if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
            const track = await TrackPlayer.getTrack(event.nextTrack);
            if (track) {
                setCurrentTrack(track);
                showPlayer();
            }
        }
    });

    useEffect(() => {
        checkCurrentTrack();
    }, []);

    const checkCurrentTrack = async (): Promise<void> => {
        try {
            const trackIndex = await TrackPlayer.getCurrentTrack();
            if (trackIndex !== null) {
                const track = await TrackPlayer.getTrack(trackIndex);
                if (track) {
                    setCurrentTrack(track);
                    showPlayer();
                }
            }
        } catch (error) {
            console.log('Error getting current track:', error);
        }
    };

    const showPlayer = (): void => {
        setIsVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    };

    const hidePlayer = (): void => {
        Animated.timing(slideAnim, {
            toValue: 100,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setIsVisible(false));
    };

    const togglePlayPause = async (): Promise<void> => {
        try {
            const state = await TrackPlayer.getState();
            if (state === State.Playing) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    const handleNext = async (): Promise<void> => {
        try {
            await TrackPlayer.skipToNext();
        } catch (error) {
            console.error('Error skipping to next:', error);
        }
    };

    if (!isVisible || !currentTrack) {
        return null;
    }

    const isPlaying = playbackState.state === State.Playing;
    const progressPercentage = progress.duration > 0
        ? (progress.position / progress.duration) * 100
        : 0;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${progressPercentage}%` }
                    ]}
                />
            </View>

            <TouchableOpacity
                style={styles.content}
                onPress={onPress}
                activeOpacity={0.9}>

                {/* Album Art / Icon */}
                <View style={styles.albumArt}>
                    <Text style={styles.albumArtIcon}>🎵</Text>
                </View>

                {/* Track Info */}
                <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                        {currentTrack.title || 'Sin título'}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                        {currentTrack.artist || 'Artista desconocido'}
                    </Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={togglePlayPause}
                        activeOpacity={0.7}>
                        <Text style={styles.controlIcon}>
                            {isPlaying ? '⏸' : '▶'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleNext}
                        activeOpacity={0.7}>
                        <Text style={styles.controlIcon}>⏭</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 16,
        zIndex: 1000,
    },
    progressBarContainer: {
        height: 3,
        backgroundColor: '#2a2a2a',
        width: '100%',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#1DB954',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    albumArt: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#252525',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    albumArtIcon: {
        fontSize: 24,
    },
    trackInfo: {
        flex: 1,
        marginRight: 12,
    },
    trackTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 2,
    },
    trackArtist: {
        fontSize: 13,
        color: '#b3b3b3',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlIcon: {
        fontSize: 18,
        color: '#ffffff',
    },
});

export default MiniPlayer;