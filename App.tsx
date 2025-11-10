/**
 * VibeBox - Media Player App
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

// Screens
import { HomeScreen, AudioPlayerScreen, VideoPlayerScreen } from './src/screens';

// Constants
import { COLORS } from './src/utils/constants';

// Ignorar warnings específicos (opcional)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createNativeStackNavigator();

// Tema oscuro para la navegación
const navigationTheme = {
  dark: true,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.backgroundLight,
    text: COLORS.textPrimary,
    border: COLORS.surface,
    notification: COLORS.primary,
  },
};

function App() {
  useEffect(() => {
    // Inicializar TrackPlayer cuando la app arranca
    setupPlayer();

    return () => {
      // Cleanup cuando la app se cierra
      TrackPlayer.destroy();
    };
  }, []);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
      });
      console.log('TrackPlayer setup complete');
    } catch (error) {
      console.log('Error setting up player:', error);
    }
  };

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