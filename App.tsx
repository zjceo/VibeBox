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
        await TrackPlayer.setupPlayer();
        console.log("TrackPlayer OK");
      } catch (e) {
        console.log(e);
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
