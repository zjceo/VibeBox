// src/screens/types.ts
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MediaFile } from '../types';

export type RootStackParamList = {
  Home: undefined;
  AudioPlayer: {
    track: MediaFile;
    playlist: MediaFile[];
  };
  VideoPlayer: {
    video: MediaFile;
    playlist: MediaFile[];
  };
  DatabaseDebug: undefined;
};

export type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export type AudioPlayerScreenProps = {
  route: RouteProp<RootStackParamList, 'AudioPlayer'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'AudioPlayer'>;
};

export type VideoPlayerScreenProps = {
  route: RouteProp<RootStackParamList, 'VideoPlayer'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;
};
