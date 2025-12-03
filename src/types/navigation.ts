// src/types/navigation.ts
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { MediaFile } from './media';

/**
 * Definición de todas las rutas de la app
 */
export type RootStackParamList = {
    Home: undefined;
    AudioPlayer: {
        file: MediaFile;
        playlist?: MediaFile[];
        currentIndex?: number;
    };
    VideoPlayer: {
        file: MediaFile;
        playlist?: MediaFile[];
        currentIndex?: number;
    };
    VideoList: undefined;
    DatabaseDebug: undefined;
    About: undefined;
    Terms: undefined;
};

/**
 * Tipo de navegación genérico para cualquier pantalla
 */
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Tipos específicos para cada pantalla
 */
export type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Home'
>;

export type AudioPlayerScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'AudioPlayer'
>;

export type VideoPlayerScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'VideoPlayer'
>;

export type VideoListScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'VideoList'
>;

export type DatabaseDebugScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'DatabaseDebug'
>;

/**
 * Tipos de Route para cada pantalla
 */
export type AudioPlayerScreenRouteProp = RouteProp<
    RootStackParamList,
    'AudioPlayer'
>;

export type VideoPlayerScreenRouteProp = RouteProp<
    RootStackParamList,
    'VideoPlayer'
>;