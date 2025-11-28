import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import CompactSidebar from '../components/CompactSidebar';
import LibraryPanel from '../components/LibraryPanel';
import MediaGrid from '../components/MediaGrid';
import LoadingScreen from '../components/LoadingScreen';
import MiniPlayer from '../components/MiniPlayer';
import MediaService from '../services/MediaService';
import PermissionsService from '../services/PermissionsService';
import FolderList from '../components/FolderList';

const HomeScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [mediaFiles, setMediaFiles] = useState({
    audio: [],
    video: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissionsAndLoadMedia();
  }, []);

  const checkPermissionsAndLoadMedia = async () => {
    try {
      const hasPermission = await PermissionsService.checkStoragePermission();

      if (!hasPermission) {
        const granted = await PermissionsService.requestStoragePermission();
        setHasPermission(granted);

        if (!granted) {
          Alert.alert(
            'Permisos necesarios',
            'VibeBox necesita acceso al almacenamiento para encontrar tus archivos multimedia.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Solicitar permisos',
                onPress: () => checkPermissionsAndLoadMedia()
              },
            ]
          );
          setLoading(false);
          return;
        }
      } else {
        setHasPermission(true);
      }

      await loadMediaFiles();
    } catch (error) {
      console.error('Error checking permissions:', error);
      setLoading(false);
    }
  };

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      const media = await MediaService.scanMediaFiles();
      setMediaFiles(media);
    } catch (error) {
      console.error('Error loading media files:', error);
      Alert.alert('Error', 'No se pudieron cargar los archivos multimedia');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMediaFiles();
    setRefreshing(false);
  };

  const handleMediaPress = (item) => {
    // Determinar el tipo de archivo
    const isAudio = item.type === 'audio' ||
      item.extension === '.mp3' ||
      item.extension === '.m4a' ||
      item.extension === '.wav';

    if (isAudio) {
      navigation.navigate('AudioPlayer', {
        track: item,
        playlist: mediaFiles.audio,
      });
    } else {
      navigation.navigate('VideoPlayer', {
        video: item,
      });
    }
  };

  const getGridMedia = () => {
    if (activeSection === 'audio') {
      return mediaFiles.audio || [];
    } else if (activeSection === 'video') {
      return mediaFiles.video || [];
    } else {
      return [...(mediaFiles.audio || []), ...(mediaFiles.video || [])];
    }
  };

  const groupMediaByFolder = (items) => {
    if (!items || items.length === 0) return [];

    const grouped = {};

    items.forEach(item => {
      // Extraer el nombre de la carpeta padre del path
      const pathParts = item.path ? item.path.split('/') : [];
      const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Sin carpeta';

      if (!grouped[folderName]) {
        grouped[folderName] = [];
      }
      grouped[folderName].push(item);
    });

    // Convertir a formato de secciones para SectionList
    return Object.keys(grouped).map(folderName => ({
      title: folderName,
      data: grouped[folderName]
    }));
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'audio':
        return 'Música';
      case 'video':
        return 'Videos';
      case 'folders':
        return 'Carpetas';
      default:
        return 'Inicio';
    }
  };

  if (loading && !refreshing) {
    return <LoadingScreen message="Escaneando archivos multimedia..." />;
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.permissionTitle}>Permisos necesarios</Text>
          <Text style={styles.permissionText}>
            VibeBox necesita acceso a tu almacenamiento para reproducir tus archivos multimedia
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={checkPermissionsAndLoadMedia}
            activeOpacity={0.8}>
            <Text style={styles.permissionButtonText}>Conceder permisos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentMedia = getGridMedia();
  const shouldGroup = activeSection === 'audio' || activeSection === 'video';
  const mediaData = shouldGroup ? groupMediaByFolder(currentMedia) : currentMedia;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={styles.mainContainer}>
        {/* Compact Sidebar */}
        <CompactSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Library Panel */}
        <LibraryPanel
          mediaFiles={mediaFiles}
          onMediaPress={handleMediaPress}
          activeSection={activeSection}
        />

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>{getSectionTitle()}</Text>
              <Text style={styles.headerSubtitle}>
                {currentMedia.length} archivos
              </Text>
            </View>
            <View style={styles.headerRight}>
              {currentMedia.length > 0 && activeSection !== 'folders' && (
                <TouchableOpacity
                  style={styles.headerButtonPrimary}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (currentMedia.length > 0) {
                      handleMediaPress(currentMedia[0]);
                    }
                  }}>
                  <Text style={styles.headerButtonPrimaryText}>
                    Reproducir todo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {activeSection === 'folders' ? (
              <FolderList
                mediaFiles={mediaFiles}
                onMediaPress={handleMediaPress}
                onUpdate={loadMediaFiles}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#1DB954"
                    colors={['#1DB954']}
                  />
                }
              />
            ) : (
              <MediaGrid
                items={mediaData}
                onItemPress={handleMediaPress}
                type={activeSection === 'audio' ? 'audio' : 'video'}
                grouped={shouldGroup}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#1DB954"
                    colors={['#1DB954']}
                  />
                }
              />
            )}
          </View>
        </View>
      </View>

      {/* Mini Player */}
      {mediaFiles.audio && mediaFiles.audio.length > 0 && (
        <MiniPlayer
          onPress={() => {
            const audioFiles = mediaFiles.audio || [];
            if (audioFiles.length > 0) {
              navigation.navigate('AudioPlayer', {
                track: audioFiles[0],
                playlist: audioFiles,
              });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 28,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerButtonPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1DB954',
    borderRadius: 10,
  },
  headerButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default HomeScreen;