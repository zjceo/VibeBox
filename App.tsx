import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

import { HomeScreen, AudioPlayerScreen, VideoPlayerScreen } from './src/screens';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    async function setup() {
      try {
        // Check if the player is already set up
        // TrackPlayer.setupPlayer() throws if already setup, but we can also just catch the error.
        // A better pattern is often to have a service manage this, but for now we'll just catch and ignore the specific error or check state if possible.
        // Since TrackPlayer doesn't have a simple isSetup() method exposed synchronously, the try-catch block is the standard way, 
        // but the user is seeing the error log. We can silence it or handle it gracefully.
        // Actually, the error "The player has already been initialized via setupPlayer" comes from the native side.
        // We can try to prevent it by using a flag or just swallowing that specific error.

        await TrackPlayer.setupPlayer();
        console.log("TrackPlayer OK");
      } catch (e: any) {
        if (e.message && e.message.includes('already been initialized')) {
          // Player is already setup, we can ignore this
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
            name="VideoPlayer"
            component={VideoPlayerScreen}
          />
        </Stack.Navigator>

      </NavigationContainer>
    </SafeAreaProvider>
  );
}
