import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import Video from 'react-native-video';
import { useVideo } from '../context/VideoContext';
import PlayerControls from './PlayerControls';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_HEIGHT = 60;

const VideoOverlay = () => {
    const {
        currentVideo,
        playlist,
        isVisible,
        isMinimized,
        minimizeVideo,
        maximizeVideo,
        closeVideo,
        setCurrentVideo,
    } = useVideo();

    const videoRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(true);

    // Animaciones
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const minimizeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible && currentVideo) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: false,
            }).start();
            setPaused(false);
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setPaused(true);
                setCurrentTime(0);
            });
        }
    }, [isVisible, currentVideo]);

    useEffect(() => {
        if (isMinimized) {
            Animated.spring(minimizeAnim, {
                toValue: 1,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.spring(minimizeAnim, {
                toValue: 0,
                useNativeDriver: false,
            }).start();
        }
    }, [isMinimized]);

    if (!currentVideo) return null;

    // Interpolaciones
    const containerHeight = minimizeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_HEIGHT, MINI_HEIGHT],
    });

    const videoWidth = minimizeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_WIDTH, 100],
    });

    const videoHeight = minimizeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_HEIGHT, MINI_HEIGHT],
    });

    const controlsOpacity = minimizeAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
    });

    const miniControlsOpacity = minimizeAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const bottomPosition = minimizeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0], // Sin offset, el MiniPlayer de audio se ocultará cuando haya video
    });

    const handleLoad = (data) => {
        setDuration(data.duration);
        setLoading(false);
    };

    const handleProgress = (data) => {
        setCurrentTime(data.currentTime);
    };

    const handleEnd = () => {
        const currentIndex = playlist.findIndex(v => v.id === currentVideo.id);
        if (currentIndex < playlist.length - 1) {
            setCurrentVideo(playlist[currentIndex + 1]);
        } else {
            setPaused(true);
        }
    };

    const togglePlayPause = () => {
        setPaused(!paused);
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    height: containerHeight,
                    bottom: bottomPosition,
                },
            ]}
        >
            <View style={styles.contentContainer}>
                <TouchableWithoutFeedback onPress={isMinimized ? maximizeVideo : () => setShowControls(!showControls)}>
                    <Animated.View style={{ width: videoWidth, height: videoHeight, backgroundColor: 'black' }}>
                        <Video
                            ref={videoRef}
                            source={{ uri: currentVideo.uri }}
                            style={styles.video}
                            paused={paused}
                            onLoad={handleLoad}
                            onProgress={handleProgress}
                            onEnd={handleEnd}
                            resizeMode="contain"
                            playInBackground={true}
                            playWhenInactive={true}
                            ignoreSilentSwitch="ignore"
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>

                {/* Mini Player Info */}
                <Animated.View style={[styles.miniPlayerInfo, { opacity: miniControlsOpacity }]}>
                    <TouchableOpacity style={styles.miniInfoText} onPress={maximizeVideo}>
                        <Text style={styles.miniTitle} numberOfLines={1}>{currentVideo.name}</Text>
                    </TouchableOpacity>
                    <View style={styles.miniControls}>
                        <TouchableOpacity onPress={togglePlayPause} style={styles.miniButton}>
                            <Text style={styles.miniIcon}>{paused ? '▶' : '⏸'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closeVideo} style={styles.miniButton}>
                            <Text style={styles.miniIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Full Screen Controls */}
                <Animated.View style={[styles.fullScreenControls, { opacity: controlsOpacity }, !showControls && { opacity: 0 }]}>
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={minimizeVideo} style={styles.iconButton}>
                            <Text style={styles.iconText}>⌄</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle} numberOfLines={1}>{currentVideo.name}</Text>
                        <TouchableOpacity onPress={closeVideo} style={styles.iconButton}>
                            <Text style={styles.iconText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.centerControls}>
                        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                            <Text style={styles.playIcon}>{paused ? '▶' : '⏸'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomControls}>
                        <PlayerControls
                            isPlaying={!paused}
                            onPlayPause={togglePlayPause}
                            position={currentTime}
                            duration={duration}
                            onSeek={(val) => videoRef.current?.seek(val)}
                            showSkipButtons={true}
                            onNext={() => handleEnd()}
                            onPrevious={() => videoRef.current?.seek(0)}
                        />
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#000',
        overflow: 'hidden',
        zIndex: 1000,
        elevation: 10,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    miniPlayerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        backgroundColor: '#1a1a1a',
        position: 'absolute',
        left: 100,
        right: 0,
        top: 0,
        bottom: 0,
    },
    miniInfoText: {
        flex: 1,
        justifyContent: 'center',
    },
    miniTitle: {
        color: 'white',
        fontWeight: 'bold',
    },
    miniControls: {
        flexDirection: 'row',
        gap: 15,
    },
    miniButton: {
        padding: 5,
    },
    miniIcon: {
        color: 'white',
        fontSize: 20,
    },
    fullScreenControls: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
        paddingVertical: 40,
        paddingHorizontal: 20,
        pointerEvents: 'box-none',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    iconButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    iconText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    centerControls: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        color: 'white',
        fontSize: 40,
    },
    bottomControls: {
        marginBottom: 20,
    }
});

export default VideoOverlay;
