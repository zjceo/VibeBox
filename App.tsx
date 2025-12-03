import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

import { HomeScreen, AudioPlayerScreen, VideoPlayerScreen } from './src/screens';
import DatabaseDebugScreen from './src/screens/DatabaseDebugScreen';
import AboutScreen from './src/screens/AboutScreen';
import TermsScreen from './src/screens/TermsScreen';

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
      <NavigationContainer theme={DarkTheme}>
        <StatusBar barStyle="light-content" />

        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            name="AudioPlayer"
            component={AudioPlayerScreen}
            options={{
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{
              animation: 'fade',
              presentation: 'fullScreenModal',
            }}
          />
          <Stack.Screen
            name="DatabaseDebug"
            component={DatabaseDebugScreen}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
          />
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
          />
        </Stack.Navigator>

      </NavigationContainer>
    </SafeAreaProvider>
  );
}