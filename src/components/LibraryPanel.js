import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const LibraryPanel = ({ mediaFiles, onMediaPress, activeSection }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Determinar qué archivos mostrar según la sección activa
  const getDisplayFiles = () => {
    if (activeSection === 'audio') {
      return mediaFiles.audio || [];
    } else if (activeSection === 'video') {
      return mediaFiles.video || [];
    } else if (activeSection === 'home') {
      // Mostrar ambos tipos en inicio
      return [...(mediaFiles.audio || []), ...(mediaFiles.video || [])];
    }
    return [];
  };

  const displayFiles = getDisplayFiles();

  const renderItem = ({ item }) => {
    const isAudio = item.type === 'audio' || item.extension === '.mp3' || item.extension === '.m4a';
    const icon = isAudio ? '🎵' : '🎬';

    return (
      <TouchableOpacity
        style={styles.mediaItem}
        onPress={() => onMediaPress(item)}
        activeOpacity={0.7}>
        <View style={styles.mediaItemContent}>
          <View style={[
            styles.mediaIcon,
            !isAudio && styles.videoIcon
          ]}>
            <Text style={styles.mediaIconText}>{icon}</Text>
          </View>
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.mediaDetails}>
              {item.extension} • {formatFileSize(item.size)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Título y subtítulo dinámicos
  const getHeaderInfo = () => {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{headerInfo.title}</Text>
        <Text style={styles.subtitle}>{headerInfo.subtitle}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          placeholderTextColor="#666666"
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
            <Text style={styles.emptyIcon}>
              {activeSection === 'audio' ? '🎵' : activeSection === 'video' ? '🎬' : '📁'}
            </Text>
            <Text style={styles.emptyText}>
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
    backgroundColor: '#0f0f0f',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
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
    color: '#ffffff',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
  },
  mediaIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  videoIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
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
    color: '#ffffff',
    marginBottom: 4,
  },
  mediaDetails: {
    fontSize: 12,
    color: '#666666',
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
    color: '#666666',
  },
});

export default LibraryPanel;