import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import MediaList from '../components/MediaList';
import LoadingScreen from '../components/LoadingScreen';
import MediaService, { MediaFile } from '../services/MediaService';
import PermissionsService from '../services/PermissionsService';

type RootStackParamList = {
    VideoPlayer: { video: MediaFile };
};

type VideoListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList> & DrawerNavigationProp<any>;

const VideoListScreen = () => {
    const navigation = useNavigation<VideoListScreenNavigationProp>();
    const [videoFiles, setVideoFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        checkPermissionsAndLoadMedia();
    }, []);

    const checkPermissionsAndLoadMedia = async () => {
        try {
            const hasPermission = await PermissionsService.checkStoragePermission();

            if (!hasPermission) {
                const granted = await PermissionsService.requestStoragePermission();
                setHasPermission(granted);

                if (!granted) {
                    Alert.alert(
                        'Permisos necesarios',
                        'VibeBox necesita acceso al almacenamiento para encontrar tus archivos multimedia.',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Solicitar permisos',
                                onPress: () => checkPermissionsAndLoadMedia()
                            },
                        ]
                    );
                    setLoading(false);
                    return;
                }
            } else {
                setHasPermission(true);
            }

            await loadMediaFiles();
        } catch (error) {
            console.error('Error checking permissions:', error);
            setLoading(false);
        }
    };

    const loadMediaFiles = async () => {
        try {
            setLoading(true);
            const media = await MediaService.scanMediaFiles();
            setVideoFiles(media.video);
        } catch (error) {
            console.error('Error loading media files:', error);
            Alert.alert('Error', 'No se pudieron cargar los archivos multimedia');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMediaFiles();
        setRefreshing(false);
    };

    const handleMediaPress = (item: MediaFile) => {
        navigation.navigate('VideoPlayer', {
            video: item,
        });
    };

    if (loading && !refreshing) {
        return <LoadingScreen message="Escaneando archivos de video..." />;
    }

    if (!hasPermission) {
        return (
            <SafeAreaView className="flex-1 bg-[#0a0a0a]">
                <StatusBar barStyle="light-content" backgroundColor="#121212" />
                <View className="flex-1 justify-center items-center p-10">
                    <Text className="text-[64px] mb-5">🔒</Text>
                    <Text className="text-2xl font-bold text-white mb-3 text-center">Permisos necesarios</Text>
                    <Text className="text-base text-[#888888] text-center mb-8 leading-6">
                        VibeBox necesita acceso a tu almacenamiento para reproducir tus archivos multimedia
                    </Text>
                    <TouchableOpacity
                        className="bg-[#1DB954] px-8 py-4 rounded-full"
                        onPress={checkPermissionsAndLoadMedia}
                        activeOpacity={0.8}>
                        <Text className="text-base font-semibold text-white">Conceder permisos</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0a0a0a]">
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-[#121212] border-b border-white/5 flex-row items-center justify-between">
                <View>
                    <Text className="text-4xl font-extrabold text-white mb-1.5 tracking-tighter">Videos</Text>
                    <Text className="text-[15px] text-[#b3b3b3] font-medium">
                        {videoFiles.length} videos
                    </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Text className="text-3xl text-white">☰</Text>
                </TouchableOpacity>
            </View>

            {/* Media List */}
            <MediaList
                items={videoFiles}
                onItemPress={handleMediaPress}
                type="video"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#1DB954"
                        colors={['#1DB954']}
                    />
                }
            />
        </SafeAreaView>
    );
};

export default VideoListScreen;
