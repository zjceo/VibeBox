import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import Video, { OnLoadData, OnProgressData } from 'react-native-video';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import PlayerControls from '../components/PlayerControls';
import { MediaFile } from '../services/MediaService';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    VideoPlayer: { video: MediaFile };
};

type VideoPlayerScreenRouteProp = RouteProp<RootStackParamList, 'VideoPlayer'>;
type VideoPlayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;

const VideoPlayerScreen = () => {
    const route = useRoute<VideoPlayerScreenRouteProp>();
    const navigation = useNavigation<VideoPlayerScreenNavigationProp>();
    const { video } = route.params;
    const videoRef = useRef<Video>(null);

    const [paused, setPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auto-ocultar controles
    useEffect(() => {
        let timeout: NodeJS.Timeout;
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

    const handleSeek = (value: number) => {
        if (videoRef.current) {
            videoRef.current.seek(value);
            setCurrentTime(value);
        }
    };

    const handleProgress = (data: OnProgressData) => {
        setCurrentTime(data.currentTime);
    };

    const handleLoad = (data: OnLoadData) => {
        setDuration(data.duration);
        setLoading(false);
    };

    const handleLoadStart = () => {
        setLoading(true);
    };

    const handleError = (err: any) => {
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
            <SafeAreaView className="flex-1 bg-black">
                <StatusBar hidden />
                <View className="flex-1 justify-center items-center p-10">
                    <Text className="text-[64px] mb-5">⚠️</Text>
                    <Text className="text-lg text-white text-center mb-8">{error}</Text>
                    <TouchableOpacity
                        className="bg-[#1DB954] px-8 py-4 rounded-full"
                        onPress={goBack}
                        activeOpacity={0.7}>
                        <Text className="text-base font-semibold text-white">Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar hidden />

            <TouchableWithoutFeedback onPress={toggleControls}>
                <View className="flex-1 justify-center items-center bg-black">
                    <Video
                        ref={videoRef}
                        source={{ uri: video.uri }}
                        style={{ width, height }}
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
                        <View className="absolute inset-0 justify-center items-center bg-black/80">
                            <ActivityIndicator size="large" color="#1DB954" />
                            <Text className="mt-4 text-base text-white">Cargando video...</Text>
                        </View>
                    )}

                    {/* Controls Overlay */}
                    {showControls && !loading && (
                        <View className="absolute inset-0 bg-black/40 justify-between">
                            {/* Top Bar */}
                            <View className="flex-row items-center px-4 py-4">
                                <TouchableOpacity
                                    className="w-10 h-10 justify-center items-center bg-black/50 rounded-full"
                                    onPress={goBack}
                                    activeOpacity={0.7}>
                                    <Text className="text-2xl text-white">←</Text>
                                </TouchableOpacity>
                                <View className="flex-1 px-4">
                                    <Text className="text-lg font-semibold text-white" numberOfLines={1}>
                                        {video.name}
                                    </Text>
                                </View>
                                <View className="w-10" />
                            </View>

                            {/* Center Play Button */}
                            {paused && (
                                <TouchableOpacity
                                    className="absolute top-1/2 left-1/2 -translate-x-10 -translate-y-10 w-20 h-20 rounded-full bg-[#1DB954]/90 justify-center items-center shadow-lg shadow-black/30"
                                    style={{ transform: [{ translateX: -40 }, { translateY: -40 }] }}
                                    onPress={handlePlayPause}
                                    activeOpacity={0.7}>
                                    <Text className="text-[32px] text-white ml-1">▶</Text>
                                </TouchableOpacity>
                            )}

                            {/* Bottom Controls */}
                            <View className="pb-5">
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
                                className="absolute top-0 bottom-0 left-0 w-[30%]"
                                onPress={() => handleSeek(Math.max(0, currentTime - 10))}
                                activeOpacity={1}
                            />
                            <TouchableOpacity
                                className="absolute top-0 bottom-0 right-0 w-[30%]"
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

export default VideoPlayerScreen;
