import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability } from 'react-native-track-player';
import { colors } from '../constants/theme';

interface SettingsContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (enabled: boolean) => void;
  highQuality: boolean;
  setHighQuality: (enabled: boolean) => void;
  isLoading: boolean;
  themeColors: typeof colors.dark;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<'light' | 'dark'>(systemColorScheme || 'dark');
  const [notifications, setNotificationsState] = useState<boolean>(true);
  const [autoPlay, setAutoPlayState] = useState<boolean>(true);
  const [highQuality, setHighQualityState] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const themeColors = theme === 'dark' ? colors.dark : colors.light;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('settings_theme');
      const storedNotifications = await AsyncStorage.getItem('settings_notifications');
      const storedAutoPlay = await AsyncStorage.getItem('settings_autoPlay');
      const storedHighQuality = await AsyncStorage.getItem('settings_highQuality');

      if (storedTheme) setThemeState(storedTheme as 'light' | 'dark');
      if (storedNotifications !== null) setNotificationsState(JSON.parse(storedNotifications));
      if (storedAutoPlay !== null) setAutoPlayState(JSON.parse(storedAutoPlay));
      if (storedHighQuality !== null) setHighQualityState(JSON.parse(storedHighQuality));
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('settings_theme', newTheme);
  };

  const setNotifications = async (enabled: boolean) => {
    setNotificationsState(enabled);
    await AsyncStorage.setItem('settings_notifications', JSON.stringify(enabled));
    updateTrackPlayerNotifications(enabled);
  };

  const setAutoPlay = async (enabled: boolean) => {
    setAutoPlayState(enabled);
    await AsyncStorage.setItem('settings_autoPlay', JSON.stringify(enabled));
  };

  const setHighQuality = async (enabled: boolean) => {
    setHighQualityState(enabled);
    await AsyncStorage.setItem('settings_highQuality', JSON.stringify(enabled));
  };

  const updateTrackPlayerNotifications = async (enabled: boolean) => {
    try {
      const capabilities = [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ];

      const compactCapabilities = [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ];

      if (enabled) {
        await TrackPlayer.updateOptions({
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities,
          capabilities
        });
      } else {
        await TrackPlayer.updateOptions({
          notificationCapabilities: [],
          compactCapabilities,
          capabilities
        });
      }
    } catch (error) {
      console.error('Error updating TrackPlayer notifications', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        notifications,
        setNotifications,
        autoPlay,
        setAutoPlay,
        highQuality,
        setHighQuality,
        isLoading,
        themeColors,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
