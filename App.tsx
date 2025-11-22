/**
 * VibeBox - Media Player App
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TrackPlayer, { Capability } from 'react-native-track-player';

// Importa las pantallas directamente (sin index.js)
import HomeScreen from './src/screens/HomeScreen.js';
import AudioPlayerScreen from './src/screens/AudioPlayerScreen.js';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen.js';

// Constants
import { COLORS } from './src/utils/constants';

// Ignorar warnings específicos
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createNativeStackNavigator();

// Tema de navegación corregido
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.backgroundLight,
    text: COLORS.textPrimary,
    border: COLORS.surface,
    notification: COLORS.primary,
  },
};

function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    let isSetup = false;

    async function setup() {
      try {
        if (isSetup) return;

        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
        });

        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
        });

        isSetup = true;
        setIsPlayerReady(true);
        console.log('✅ TrackPlayer setup complete');
      } catch (error) {
        if (error.message?.includes('already been initialized')) {
          console.log('ℹ️ TrackPlayer already initialized');
          setIsPlayerReady(true);
        } else {
          console.error('❌ Error setting up player:', error);
        }
      }
    }

    setup();

    return () => {
      TrackPlayer.reset().catch(err =>
        console.log('Error resetting player:', err)
      );
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
          translucent={false}
        />

        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: COLORS.background,
            },
          }}>

          {/* Pantalla principal */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'VibeBox',
            }}
          />

          {/* Reproductor de Audio */}
          <Stack.Screen
            name="AudioPlayer"
            component={AudioPlayerScreen}
            options={{
              title: 'Reproductor',
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />

          {/* Reproductor de Video */}
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{
              title: 'Video',
              animation: 'fade',
              presentation: 'fullScreenModal',
              orientation: 'all',
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;