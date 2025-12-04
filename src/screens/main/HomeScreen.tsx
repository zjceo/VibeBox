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
import CompactSidebar, { SectionId } from '../../components/ui/CompactSidebar';
import LibraryPanel from '../../components/ui/LibraryPanel';
import MediaGrid from '../../components/media/MediaGrid';
import LoadingScreen from '../../components/ui/LoadingScreen';
import MiniPlayer from '../../components/audio/MiniPlayer';
import MediaService from '../../services/MediaService';
import PermissionsService from '../../services/PermissionsService';
import FavoritesService from '../../services/FavoritesService';
import FolderList from '../../components/media/FolderList';
import PlaylistList from '../../components/playlists/PlaylistList';
import PlaylistDetail from '../../components/playlists/PlaylistDetail';
import { useSettings } from '../../context/SettingsContext';

const HomeScreen = ({ navigation }) => {
  const { themeColors, theme } = useSettings();
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [mediaFiles, setMediaFiles] = useState({
    audio: [],
    video: [],
    favorites: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showLibraryPanel, setShowLibraryPanel] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    checkPermissionsAndLoadMedia();
  }, []);

  useEffect(() => {
    if (activeSection !== 'playlists') {
      setSelectedPlaylist(null);
    }
    if (activeSection === 'favorites') {
      loadFavorites();
    }
  }, [activeSection]);

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
      console.log('⏳ Loading media files...');
      const startTime = Date.now();

      const media = await MediaService.scanMediaFiles();
      const favorites = await FavoritesService.getAll();
      setMediaFiles({ ...media, favorites });

      const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Media loaded in ${loadTime}s`);
    } catch (error) {
      console.error('Error loading media files:', error);
      Alert.alert('Error', 'No se pudieron cargar los archivos multimedia');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favorites = await FavoritesService.getAll();
      setMediaFiles(prev => ({ ...prev, favorites }));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMediaFiles();
    setRefreshing(false);
  };

  const handleRescan = async () => {
    setLoading(true);
    try {
      const media = await MediaService.scanMediaFiles(true);
      const favorites = await FavoritesService.getAll();
      setMediaFiles({ ...media, favorites });
      Alert.alert('Escaneo completado', 'Se ha actualizado tu biblioteca multimedia.');
    } catch (error) {
      console.error('Error rescanning:', error);
      Alert.alert('Error', 'No se pudo completar el escaneo.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN ACTUALIZADA - Sin VideoContext
  const handleMediaPress = (item) => {
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
      // Navegar directamente a VideoPlayerScreen
      navigation.navigate('VideoPlayer', {
        video: item,
        playlist: mediaFiles.video,
      });
    }
  };

  const getGridMedia = () => {
    if (activeSection === 'audio') {
      return mediaFiles.audio || [];
    } else if (activeSection === 'video') {
      return mediaFiles.video || [];
    } else if (activeSection === 'favorites') {
      return mediaFiles.favorites || [];
    } else {
      return [...(mediaFiles.audio || []), ...(mediaFiles.video || [])];
    }
  };

  const groupMediaByFolder = (items) => {
    if (!items || items.length === 0) return [];

    const grouped = {};

    items.forEach(item => {
      const pathParts = item.path ? item.path.split('/') : [];
      const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Sin carpeta';

      if (!grouped[folderName]) {
        grouped[folderName] = [];
      }
      grouped[folderName].push(item);
    });

    return Object.keys(grouped).map(folderName => ({
      title: folderName,
      data: grouped[folderName]
    }));
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'audio':
        return 'Music';
      case 'video':
        return 'Videos';
      case 'folders':
        return 'Carpetas';
      case 'favorites':
        return 'Favoritos';
      case 'playlists':
        return selectedPlaylist ? selectedPlaylist.name : 'Listas de reproducción';
      default:
        return 'Inicio';
    }
  };

  if (loading && !refreshing) {
    return <LoadingScreen message="Cargando biblioteca..." />;
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar 
          barStyle={theme === 'dark' ? "light-content" : "dark-content"} 
          backgroundColor={themeColors.background} 
        />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={[styles.permissionTitle, { color: themeColors.text }]}>Permisos necesarios</Text>
          <Text style={[styles.permissionText, { color: themeColors.textSecondary }]}>
            VibeBox necesita acceso a tu almacenamiento para reproducir tus archivos multimedia
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: themeColors.primary }]}
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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={themeColors.background} 
      />
      <View style={styles.mainContainer}>
        <CompactSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onRescan={handleRescan}
        />

        <View style={[styles.contentArea, { backgroundColor: themeColors.background }]}>
          {activeSection === 'home' && showLibraryPanel ? (
            <LibraryPanel
              mediaFiles={mediaFiles}
              onMediaPress={handleMediaPress}
              activeSection={activeSection}
            />
          ) : (
            <>
              <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                <View style={styles.headerLeft}>
                  <Text style={[styles.headerTitle, { color: themeColors.text }]}>
                    {getSectionTitle()}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: themeColors.textTertiary }]}>
                    {activeSection === 'playlists' && !selectedPlaylist
                      ? 'Tus colecciones'
                      : `${currentMedia.length} archivos`}
                  </Text>
                </View>
                <View style={styles.headerRight}>
                  {currentMedia.length > 0 && activeSection !== 'folders' && activeSection !== 'playlists' && (
                    <TouchableOpacity
                      style={[styles.headerButtonPrimary, { backgroundColor: themeColors.primary }]}
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
                        tintColor={themeColors.primary}
                        colors={[themeColors.primary]}
                      />
                    }
                  />
                ) : activeSection === 'playlists' ? (
                  selectedPlaylist ? (
                    <PlaylistDetail
                      playlist={selectedPlaylist}
                      onBack={() => setSelectedPlaylist(null)}
                      onItemPress={handleMediaPress}
                    />
                  ) : (
                    <PlaylistList
                      onPlaylistPress={setSelectedPlaylist}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                          tintColor={themeColors.primary}
                          colors={[themeColors.primary]}
                        />
                      }
                    />
                  )
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
                        tintColor={themeColors.primary}
                        colors={[themeColors.primary]}
                      />
                    }
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>
      <MiniPlayer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 36,
    paddingVertical: 28,
    paddingTop: 32,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
    flexShrink: 0,
  },
  headerButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerButtonPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
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