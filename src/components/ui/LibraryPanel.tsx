import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import type { MediaFile } from '../../types';
import { useSettings } from '../../context/SettingsContext';

type SectionId = 'home' | 'audio' | 'video' | 'favorites' | 'folders';

interface MediaFiles {
  audio?: MediaFile[];
  video?: MediaFile[];
}

interface LibraryPanelProps {
  mediaFiles: MediaFiles;
  onMediaPress: (file: MediaFile) => void;
  activeSection: SectionId;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({
  mediaFiles,
  onMediaPress,
  activeSection
}) => {
  const { themeColors } = useSettings();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getItemName = (item: MediaFile): string => {
    return item.filename || item.name || item.title || 'Sin nombre';
  };

  // Determinar qué archivos mostrar según la sección activa
  const getDisplayFiles = (): MediaFile[] => {
    if (activeSection === 'audio') {
      return mediaFiles.audio || [];
    } else if (activeSection === 'video') {
      return mediaFiles.video || [];
    } else if (activeSection === 'home') {
      return [...(mediaFiles.audio || []), ...(mediaFiles.video || [])];
    }
    return [];
  };

  const displayFiles = getDisplayFiles();

  const renderItem: ListRenderItem<MediaFile> = ({ item }) => {
    const isAudio = item.type === 'audio';
    const icon = isAudio ? '🎵' : '🎬';

    return (
      <TouchableOpacity
        style={styles.mediaItem}
        onPress={() => onMediaPress(item)}
        activeOpacity={0.7}>
        <View style={[styles.mediaItemContent, { backgroundColor: themeColors.surfaceHighlight }]}>
          <View style={[
            styles.mediaIcon,
            { backgroundColor: isAudio ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255, 59, 48, 0.1)' }
          ]}>
            <Text style={styles.mediaIconText}>{icon}</Text>
          </View>
          <View style={styles.mediaInfo}>
            <Text style={[styles.mediaName, { color: themeColors.text }]} numberOfLines={2}>
              {getItemName(item)}
            </Text>
            <Text style={[styles.mediaDetails, { color: themeColors.textSecondary }]}>
              {item.extension || item.type.toUpperCase()} • {formatFileSize(item.size)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Título y subtítulo dinámicos
  const getHeaderInfo = (): { title: string; subtitle: string } => {
    switch (activeSection) {
      case 'audio':
        return { title: 'Música', subtitle: `${mediaFiles.audio?.length || 0} canciones` };
      case 'video':
        return { title: 'Videos', subtitle: `${mediaFiles.video?.length || 0} videos` };
      case 'home':
        return { title: 'Biblioteca', subtitle: 'Todos tus archivos' };
      case 'favorites':
        return { title: 'Favoritos', subtitle: 'Tus preferidos' };
      case 'folders':
        return { title: 'Carpetas', subtitle: 'Organizado' };
      default:
        return { title: 'Biblioteca', subtitle: 'Todos tus archivos' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface, borderRightColor: themeColors.border }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>{headerInfo.title}</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{headerInfo.subtitle}</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: themeColors.surfaceHighlight }]}>
        <Text style={[styles.searchIcon, { color: themeColors.textSecondary }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder="Buscar..."
          placeholderTextColor={themeColors.textTertiary}
        />
      </View>

      {/* Media List */}
      <FlatList
        data={displayFiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon, { color: themeColors.textTertiary }]}>
              {activeSection === 'audio' ? '🎵' : activeSection === 'video' ? '🎬' : '📁'}
            </Text>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              {activeSection === 'audio' ? 'No hay archivos de audio' :
                activeSection === 'video' ? 'No hay videos' :
                  'No hay archivos'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320,
    borderRightWidth: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 20,
    marginTop: 18,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  mediaItem: {
    marginBottom: 10,
  },
  mediaItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
  },
  mediaIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mediaIconText: {
    fontSize: 20,
  },
  mediaInfo: {
    flex: 1,
  },
  mediaName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  mediaDetails: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default LibraryPanel;