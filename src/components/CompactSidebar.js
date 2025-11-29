import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import SettingsModal from './SettingsModal';

const CompactSidebar = ({ activeSection, onSectionChange }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  const sections = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'audio', icon: '🎵', label: 'Audio' },
    { id: 'video', icon: '🎬', label: 'Video' },
    { id: 'favorites', icon: '❤️', label: 'Favoritos' },
    { id: 'folders', icon: '📁', label: 'Carpetas' },
  ];

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.scrollContentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={[styles.logoContainer, isLandscape && styles.logoContainerLandscape]}>
          <View style={[styles.logo, isLandscape && styles.logoLandscape]}>
            <Text style={[styles.logoText, isLandscape && styles.logoTextLandscape]}>V</Text>
          </View>
        </View>

        {/* Navigation */}
        <View style={[styles.navigation, isLandscape && styles.navigationLandscape]}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.navButton,
                isLandscape && styles.navButtonLandscape,
                activeSection === section.id && styles.navButtonActive,
              ]}
              onPress={() => onSectionChange(section.id)}
              activeOpacity={0.7}>
              <Text style={[styles.navIcon, isLandscape && styles.navIconLandscape]}>{section.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Button */}
        <TouchableOpacity
          style={[styles.menuButton, isLandscape && styles.menuButtonLandscape]}
          activeOpacity={0.7}
          onPress={() => setShowSettings(true)}>
          <Text style={[styles.menuIcon, isLandscape && styles.menuIconLandscape]}>☰</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    backgroundColor: '#121212',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
    height: '100%',
  },
  containerLandscape: {
    width: 70, // Slightly narrower in landscape
  },
  scrollContent: {
    paddingVertical: 28,
    paddingTop: 32,
    alignItems: 'center',
    minHeight: '100%',
  },
  scrollContentLandscape: {
    paddingVertical: 16,
    paddingTop: 16,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoContainerLandscape: {
    marginBottom: 20,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  logoLandscape: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  logoTextLandscape: {
    fontSize: 20,
  },
  navigation: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  navigationLandscape: {
    gap: 12,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  navButtonLandscape: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  navButtonActive: {
    backgroundColor: '#1DB954',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  navIcon: {
    fontSize: 24,
  },
  navIconLandscape: {
    fontSize: 20,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 20,
  },
  menuButtonLandscape: {
    width: 40,
    height: 40,
    marginTop: 10,
  },
  menuIcon: {
    fontSize: 20,
    color: '#888888',
  },
  menuIconLandscape: {
    fontSize: 18,
  },
});

export default CompactSidebar;