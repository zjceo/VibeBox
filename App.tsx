import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

import { 
  HomeScreen, 
  AudioPlayerScreen, 
  VideoPlayerScreen,
  DatabaseDebugScreen, 
  AboutScreen, 
  TermsScreen 
} from './src/screens';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <StatusBar 
          barStyle={isDark ? "light-content" : "dark-content"} 
          backgroundColor={isDark ? "#000000" : "#ffffff"}
        />

        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: isDark ? '#000000' : '#ffffff' }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
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
          <Stack.Screen name="DatabaseDebug" component={DatabaseDebugScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

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
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}