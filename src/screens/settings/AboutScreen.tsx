import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const openGitHub = () => {
    Linking.openURL('https://github.com/zjceo/VibeBox');
  };

  const InfoCard: React.FC<{ icon: string; title: string; value: string }> = ({
    icon,
    title,
    value,
  }) => (
    <View style={styles.infoCard}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </View>
  );

  const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de VibeBox</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Icon & Version */}
        <View style={styles.appSection}>
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>🎵</Text>
          </View>
          <Text style={styles.appName}>VibeBox</Text>
          <Text style={styles.appTagline}>Tu reproductor multimedia offline</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <InfoCard
            icon="📱"
            title="Plataforma"
            value="React Native 0.75.1"
          />
          <InfoCard
            icon="⚡"
            title="Motor de Audio"
            value="React Native Track Player"
          />
          <InfoCard
            icon="🎬"
            title="Motor de Video"
            value="React Native Video"
          />
          <InfoCard
            icon="💾"
            title="Base de Datos"
            value="SQLite Storage"
          />
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Características</Text>
          <View style={styles.featuresGrid}>
            <FeatureItem icon="🎧" text="Reproducción de audio" />
            <FeatureItem icon="🎬" text="Reproducción de video" />
            <FeatureItem icon="📂" text="Organización por carpetas" />
            <FeatureItem icon="🎼" text="Listas de reproducción" />
            <FeatureItem icon="❤️" text="Sistema de favoritos" />
            <FeatureItem icon="🔍" text="Búsqueda avanzada" />
            <FeatureItem icon="🔄" text="Reproducción en segundo plano" />
            <FeatureItem icon="🔔" text="Notificaciones multimedia" />
            <FeatureItem icon="📊" text="Gestión de base de datos" />
            <FeatureItem icon="🌙" text="Modo oscuro" />
          </View>
        </View>

        {/* Tech Stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Tecnologías</Text>
          <View style={styles.techList}>
            <TechItem name="TypeScript" version="5.8.3" />
            <TechItem name="React Navigation" version="6.x" />
            <TechItem name="AsyncStorage" version="2.2.0" />
            <TechItem name="React Native FS" version="2.20.0" />
            <TechItem name="React Native Permissions" version="5.4.4" />
          </View>
        </View>

        {/* GitHub Link */}
        <TouchableOpacity style={styles.githubButton} onPress={openGitHub}>
          <Text style={styles.githubIcon}>⭐</Text>
          <View style={styles.githubContent}>
            <Text style={styles.githubTitle}>Código Fuente</Text>
            <Text style={styles.githubSubtitle}>github.com/zjceo/VibeBox</Text>
          </View>
          <Text style={styles.githubArrow}>›</Text>
        </TouchableOpacity>

        {/* Credits */}
        <View style={styles.creditsSection}>
          <Text style={styles.creditsTitle}>Hecho con ❤️</Text>
          <Text style={styles.creditsText}>
            VibeBox es un reproductor multimedia offline de código abierto
          </Text>
          <Text style={styles.creditsText}>
            diseñado para disfrutar tu música y videos locales
          </Text>
          <Text style={styles.copyright}>© 2025 VibeBox</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const TechItem: React.FC<{ name: string; version: string }> = ({ name, version }) => (
  <View style={styles.techItem}>
    <View style={styles.techDot} />
    <Text style={styles.techName}>{name}</Text>
    <Text style={styles.techVersion}>{version}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  appSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  appIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(29, 185, 84, 0.3)',
  },
  appIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 16,
  },
  versionBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
  techList: {
    gap: 10,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  techDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1DB954',
    marginRight: 12,
  },
  techName: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  techVersion: {
    fontSize: 13,
    color: '#888888',
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  githubIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  githubContent: {
    flex: 1,
  },
  githubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  githubSubtitle: {
    fontSize: 13,
    color: '#1DB954',
  },
  githubArrow: {
    fontSize: 26,
    color: '#666666',
  },
  creditsSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  creditsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  creditsText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  copyright: {
    fontSize: 12,
    color: '#666666',
    marginTop: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AboutScreen;
