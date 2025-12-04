import React from 'react';
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
import type { RootStackNavigationProp } from '../../types';
import { useSettings } from '../../context/SettingsContext';

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
  colors: any;
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
  color: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onRescan
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { 
    theme, 
    setTheme, 
    notifications, 
    setNotifications, 
    autoPlay, 
    setAutoPlay, 
    highQuality, 
    setHighQuality 
  } = useSettings();

  const isDark = theme === 'dark';
  const setDarkMode = (value: boolean) => setTheme(value ? 'dark' : 'light');

  const colors = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    subtext: isDark ? '#888888' : '#666666',
    itemBackground: isDark ? '#1a1a1a' : '#f5f5f5',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
    iconBg: isDark ? 'rgba(29, 185, 84, 0.15)' : 'rgba(29, 185, 84, 0.1)',
    iconBorder: isDark ? 'rgba(29, 185, 84, 0.3)' : 'rgba(29, 185, 84, 0.2)',
    closeBg: isDark ? '#2a2a2a' : '#f0f0f0',
    closeIcon: isDark ? '#ffffff' : '#000000',
    sectionHeader: isDark ? '#666666' : '#888888',
  };

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
    rightComponent,
    colors
  }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.itemBackground }]}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.subtext }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
      </View>
    </View>
  );

  const SectionHeader: React.FC<SectionHeaderProps> = ({ title, color }) => (
    <Text style={[styles.sectionHeader, { color }]}>{title}</Text>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
                <Text style={styles.headerIcon}>⚙️</Text>
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Configuración</Text>
                <Text style={styles.headerSubtitle}>VibeBox v1.0</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.closeBg }]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={[styles.closeIcon, { color: colors.closeIcon }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

            {/* Reproducción */}
            <SectionHeader title="REPRODUCCIÓN" color={colors.sectionHeader} />

            <SettingItem
              icon="▶️"
              title="Reproducción automática"
              subtitle="Continuar con la siguiente canción"
              colors={colors}
              rightComponent={
                <Switch
                  value={autoPlay}
                  onValueChange={setAutoPlay}
                  trackColor={{ false: isDark ? '#3a3a3a' : '#d0d0d0', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            <SettingItem
              icon="🎵"
              title="Alta calidad"
              subtitle="Mejor calidad de audio"
              colors={colors}
              rightComponent={
                <Switch
                  value={highQuality}
                  onValueChange={setHighQuality}
                  trackColor={{ false: isDark ? '#3a3a3a' : '#d0d0d0', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            {/* Apariencia */}
            <SectionHeader title="APARIENCIA" color={colors.sectionHeader} />

            <SettingItem
              icon="🌙"
              title="Modo oscuro"
              subtitle={isDark ? "Tema oscuro activado" : "Tema claro activado"}
              colors={colors}
              rightComponent={
                <Switch
                  value={isDark}
                  onValueChange={setDarkMode}
                  trackColor={{ false: isDark ? '#3a3a3a' : '#d0d0d0', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            <SettingItem
              icon="🔔"
              title="Notificaciones"
              subtitle="Alertas de reproducción"
              colors={colors}
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: isDark ? '#3a3a3a' : '#d0d0d0', true: '#1DB954' }}
                  thumbColor="#ffffff"
                />
              }
            />

            {/* Biblioteca */}
            <SectionHeader title="BIBLIOTECA" color={colors.sectionHeader} />

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.itemBackground }]}
              onPress={handleRescanMedia}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🔄</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Escanear archivos</Text>
                <Text style={[styles.actionSubtitle, { color: colors.subtext }]}>Buscar nuevos archivos multimedia</Text>
              </View>
              <Text style={[styles.actionArrow, { color: colors.sectionHeader }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.itemBackground }]}
              onPress={handleClearCache}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🗑️</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Limpiar caché</Text>
                <Text style={[styles.actionSubtitle, { color: colors.subtext }]}>Liberar espacio de almacenamiento</Text>
              </View>
              <Text style={[styles.actionArrow, { color: colors.sectionHeader }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.itemBackground }]}
              onPress={() => {
                onClose();
                navigation.navigate('DatabaseDebug');
              }}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🔍</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Database Debug</Text>
                <Text style={[styles.actionSubtitle, { color: colors.subtext }]}>Ver estadísticas y gestionar la base de datos</Text>
              </View>
              <Text style={[styles.actionArrow, { color: colors.sectionHeader }]}>›</Text>
            </TouchableOpacity>

            {/* Acerca de */}
            <SectionHeader title="INFORMACIÓN" color={colors.sectionHeader} />

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.itemBackground }]}
              onPress={() => {
                onClose();
                navigation.navigate('About');
              }}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>ℹ️</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Acerca de VibeBox</Text>
                <Text style={[styles.actionSubtitle, { color: colors.subtext }]}>Versión 1.0.0</Text>
              </View>
              <Text style={[styles.actionArrow, { color: colors.sectionHeader }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.itemBackground }]}
              onPress={() => {
                onClose();
                navigation.navigate('Terms');
              }}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>📄</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Términos y privacidad</Text>
                <Text style={[styles.actionSubtitle, { color: colors.subtext }]}>Políticas de uso</Text>
              </View>
              <Text style={[styles.actionArrow, { color: colors.sectionHeader }]}>›</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.subtext }]}>Hecho con ❤️ para reproducir tu música y videos</Text>
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
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    overflow: 'hidden',
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: '300',
  },
  content: {
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
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
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  settingRight: {
    marginLeft: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
  },
  actionArrow: {
    fontSize: 26,
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
    textAlign: 'center',
  },
});

export default SettingsModal;