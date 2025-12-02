import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

import { VideoProvider } from './src/context/VideoContext';
import VideoOverlay from './src/components/VideoOverlay';
import { HomeScreen, AudioPlayerScreen, VideoPlayerScreen } from './src/screens';
import DatabaseDebugScreen from './src/screens/DatabaseDebugScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    async function setup() {
      try {
        await TrackPlayer.setupPlayer();
        console.log("TrackPlayer OK");
      } catch (e: any) {
        if (e.message && e.message.includes('already been initialized')) {
          console.log("TrackPlayer already initialized");
        } else {
          console.log("TrackPlayer setup error", e);
        }
      }
    }
    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <VideoProvider>
        <NavigationContainer theme={DarkTheme}>
          <StatusBar barStyle="light-content" />

          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
            />
            <Stack.Screen
              name="AudioPlayer"
              component={AudioPlayerScreen}
            />
            <Stack.Screen
              name="DatabaseDebug"
              component={DatabaseDebugScreen}
            />
            <Stack.Screen
              name="VideoPlayer"
              component={VideoPlayerScreen}
            />
          </Stack.Navigator>

          <VideoOverlay />

        </NavigationContainer>
      </VideoProvider>
    </SafeAreaProvider>
  );
}
