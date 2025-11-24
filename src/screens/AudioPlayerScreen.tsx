import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TrackPlayer, { Event, State, useTrackPlayerEvents, RepeatMode } from 'react-native-track-player';

import PlayerControls from '../components/PlayerControls';
import LoadingScreen from '../components/LoadingScreen';
import AudioPlayerService from '../services/AudioPlayerService';
import { MediaFile } from '../services/MediaService';

const { width } = Dimensions.get('window');

type RootStackParamList = {
    AudioPlayer: { track: MediaFile; playlist: MediaFile[] };
};

type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;
type AudioPlayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AudioPlayer'>;

const AudioPlayerScreen = () => {
    const route = useRoute<AudioPlayerScreenRouteProp>();
    const navigation = useNavigation<AudioPlayerScreenNavigationProp>();
    const { track, playlist = [] } = route.params;

    const [currentTrack, setCurrentTrack] = useState<MediaFile>(track);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'playlist'>('off');
    const [shuffleEnabled, setShuffleEnabled] = useState(false);

    useEffect(() => {
        initializePlayer();

        return () => {
            // Cleanup cuando se desmonta el componente
            AudioPlayerService.pause();
        };
    }, []);

    // Evento para actualizar el progreso
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isPlaying) {
                const progress = await AudioPlayerService.getProgress();
                setPosition(progress.position);
                setDuration(progress.duration);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    // Track Player Events
    useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
        if (event.type === Event.PlaybackState) {
            const state = await AudioPlayerService.getState();
            setIsPlaying(state === State.Playing);
        }

        if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
            const trackIndex = await TrackPlayer.getActiveTrackIndex();
            if (trackIndex != null) {
                const trackObject = await TrackPlayer.getTrack(trackIndex);
                if (trackObject) {
                    // Buscar el track en el playlist
                    const fullTrack = playlist.find(t => t.id === trackObject.id); // Assuming ID matches
                    if (fullTrack) {
                        setCurrentTrack(fullTrack);
                    } else {
                        // Fallback if not found in playlist (shouldn't happen if playlist is sync)
                        // Construct a temporary MediaFile from TrackObject
                        setCurrentTrack({
                            id: trackObject.url, // or some other ID
                            name: trackObject.title || 'Unknown',
                            path: trackObject.url,
                            size: 0,
                            extension: '',
                            type: 'audio',
                            uri: trackObject.url,
                            artist: trackObject.artist,
                            artwork: trackObject.artwork
                        } as MediaFile);
                    }
                }
            }
        }
    });

    const initializePlayer = async () => {
        try {
            setLoading(true);
            // await AudioPlayerService.initialize(); // Removed as per service
            await AudioPlayerService.reset();

            // Agregar toda la playlist
            await AudioPlayerService.addTracks(playlist);

            // Buscar el índice del track actual
            const trackIndex = playlist.findIndex(t => t.id === track.id);

            // Saltar al track seleccionado
            if (trackIndex > 0) {
                await TrackPlayer.skip(trackIndex);
            }

            // Reproducir
            await AudioPlayerService.play();
            setIsPlaying(true);
        } catch (error) {
            console.error('Error initializing player:', error);
            Alert.alert('Error', 'No se pudo inicializar el reproductor');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPause = async () => {
        try {
            if (isPlaying) {
                await AudioPlayerService.pause();
                setIsPlaying(false);
            } else {
                await AudioPlayerService.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    const handleNext = async () => {
        try {
            await AudioPlayerService.skipToNext();
        } catch (error) {
            console.error('Error skipping to next:', error);
        }
    };

    const handlePrevious = async () => {
        try {
            await AudioPlayerService.skipToPrevious();
        } catch (error) {
            console.error('Error skipping to previous:', error);
        }
    };

    const handleSeek = async (value: number) => {
        try {
            await AudioPlayerService.seekTo(value);
        } catch (error) {
            console.error('Error seeking:', error);
        }
    };

    const toggleRepeat = async () => {
        try {
            let newMode: 'off' | 'track' | 'playlist';
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
        } catch (error) {
            console.error('Error toggling repeat:', error);
        }
    };

    const getRepeatIcon = () => {
        if (repeatMode === 'off') return '🔁';
        if (repeatMode === 'track') return '🔂';
        return '🔁';
    };

    if (loading) {
        return <LoadingScreen message="Cargando reproductor..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0a0a0a]">
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity
                    className="w-10 h-10 justify-center items-center"
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}>
                    <Text className="text-[28px] text-white">←</Text>
                </TouchableOpacity>
                <Text className="text-base font-semibold text-white">Reproduciendo</Text>
                <View className="w-10" />
            </View>

            {/* Album Art */}
            <View className="flex-1 justify-center items-center py-10">
                <View className="w-[75%] aspect-square rounded-3xl bg-[#1a1a1a] justify-center items-center border-[3px] border-[#1DB954]/15 shadow-xl shadow-[#1DB954]/25">
                    <Text className="text-[120px] text-[#1DB954]/30 shadow-sm">🎵</Text>
                </View>
            </View>

            {/* Track Info */}
            <View className="px-8 py-7 items-center bg-[#1a1a1a]/40 mx-5 rounded-[20px] mt-5 border border-white/5">
                <Text className="text-[26px] font-extrabold text-white text-center mb-2.5 tracking-tighter shadow-sm" numberOfLines={2}>
                    {currentTrack.name}
                </Text>
                <Text className="text-[17px] text-[#b3b3b3] text-center font-semibold">
                    Desconocido • {currentTrack.extension}
                </Text>
            </View>

            {/* Player Controls */}
            <PlayerControls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSeek={handleSeek}
                position={position}
                duration={duration}
                showSkipButtons={true}
            />

            {/* Additional Controls */}
            <View className="flex-row justify-center items-center px-10 py-6 gap-20 bg-[#1a1a1a]/30 mx-10 rounded-[50px]">
                <TouchableOpacity
                    className="w-14 h-14 justify-center items-center bg-white/5 rounded-full"
                    onPress={toggleRepeat}
                    activeOpacity={0.7}>
                    <Text className={`text-2xl ${repeatMode !== 'off' ? 'opacity-100 text-[#1DB954]' : 'opacity-50 text-white'}`}>
                        {getRepeatIcon()}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-14 h-14 justify-center items-center bg-white/5 rounded-full"
                    onPress={() => setShuffleEnabled(!shuffleEnabled)}
                    activeOpacity={0.7}>
                    <Text className={`text-2xl ${shuffleEnabled ? 'opacity-100 text-[#1DB954]' : 'opacity-50 text-white'}`}>
                        🔀
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Playlist Info */}
            <View className="px-8 pb-6 items-center mt-2">
                <Text className="text-[15px] text-[#9a9a9a] font-semibold">
                    {playlist.length} canciones en la lista
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default AudioPlayerScreen;
