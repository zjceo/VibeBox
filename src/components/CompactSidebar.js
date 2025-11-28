import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const CompactSidebar = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'audio', icon: '🎵', label: 'Audio' },
    { id: 'video', icon: '🎬', label: 'Video' },
    { id: 'favorites', icon: '❤️', label: 'Favoritos' },
    { id: 'folders', icon: '📁', label: 'Carpetas' },
  ];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>V</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.navButton,
              activeSection === section.id && styles.navButtonActive,
            ]}
            onPress={() => onSectionChange(section.id)}
            activeOpacity={0.7}>
            <Text style={styles.navIcon}>{section.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    backgroundColor: '#121212',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
    paddingVertical: 28,
    paddingTop: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
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
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  navigation: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIcon: {
    fontSize: 20,
    color: '#888888',
  },
});

export default CompactSidebar;