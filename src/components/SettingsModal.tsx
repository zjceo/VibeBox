import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../types';

/**
 * Props del componente SettingsModal
 */
interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onRescan?: () => void;
}

/**
 * Props de un item de configuración con Switch
 */
interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  rightComponent: React.ReactNode;
}

/**
 * Props de un item de acción (botones)
 */
interface ActionItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

/**
 * Props del encabezado de sección
 */
interface SectionHeaderProps {
  title: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onRescan
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [highQuality, setHighQuality] = useState<boolean>(true);

  const handleRescanMedia = (): void => {
    Alert.alert(
      'Escanear archivos',
      '¿Quieres buscar nuevos archivos multimedia en tu dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Escanear',
          onPress: () => {
            if (onRescan) {
              onRescan();
            }
            onClose();
          }
        }
      ]
    );
  };

  const handleClearCache = (): void => {
    Alert.alert(
      'Limpiar caché',
      '¿Estás seguro? Esto eliminará archivos temporales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Hecho', 'Caché limpiado exitosamente');
            onClose();
          }
        }
      ]
    );
  };

  const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    subtitle,
    rightComponent
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
      </View>
    </View>
  );

  const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.headerIcon}>⚙️</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Configuración</Text>
                <Text style={styles.headerSubtitle}>VibeBox v1.0</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

            {/* Reproducción */}
            <SectionHeader title="REPRODUCCIÓN" />

            <SettingItem
              icon="▶️"
              title="Reproducción automática"
              subtitle="Continuar con la siguiente canción"
              rightComponent={
                <Switch
                  value={autoPlay}
                  onValueChange={setAutoPlay}
                  trackColor={{ false: '#3a3a3a', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            <SettingItem
              icon="🎵"
              title="Alta calidad"
              subtitle="Mejor calidad de audio"
              rightComponent={
                <Switch
                  value={highQuality}
                  onValueChange={setHighQuality}
                  trackColor={{ false: '#3a3a3a', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            {/* Apariencia */}
            <SectionHeader title="APARIENCIA" />

            <SettingItem
              icon="🌙"
              title="Modo oscuro"
              subtitle="Tema oscuro activado"
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#3a3a3a', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            <SettingItem
              icon="🔔"
              title="Notificaciones"
              subtitle="Alertas de reproducción"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#3a3a3a', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            {/* Biblioteca */}
            <SectionHeader title="BIBLIOTECA" />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleRescanMedia}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🔄</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Escanear archivos</Text>
                <Text style={styles.actionSubtitle}>Buscar nuevos archivos multimedia</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleClearCache}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🗑️</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Limpiar caché</Text>
                <Text style={styles.actionSubtitle}>Liberar espacio de almacenamiento</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                onClose();
                navigation.navigate('DatabaseDebug');
              }}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🔍</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Database Debug</Text>
                <Text style={styles.actionSubtitle}>Ver estadísticas y gestionar la base de datos</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            {/* Acerca de */}
            <SectionHeader title="INFORMACIÓN" />

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>ℹ️</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Acerca de VibeBox</Text>
                <Text style={styles.actionSubtitle}>Versión 1.0.0</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>📄</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Términos y privacidad</Text>
                <Text style={styles.actionSubtitle}>Políticas de uso</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Hecho con ❤️ para reproducir tu música y videos</Text>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#121212',
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.3)',
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '300',
  },
  content: {
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
    letterSpacing: 1.2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  settingIcon: {
    fontSize: 22,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#888888',
  },
  settingRight: {
    marginLeft: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#888888',
  },
  actionArrow: {
    fontSize: 26,
    color: '#666666',
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
});

export default SettingsModal;