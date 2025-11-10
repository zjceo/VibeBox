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
import { MediaList, LoadingScreen, CustomTabBar } from '../components';
import MediaService from '../services/MediaService';
import PermissionsService from '../services/PermissionsService';

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('audio');
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
    if (item.type === 'audio') {
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

  if (loading && !refreshing) {
    return <LoadingScreen message="Escaneando archivos multimedia..." />;
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
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

  const currentMedia = activeTab === 'audio' ? mediaFiles.audio : mediaFiles.video;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VibeBox</Text>
        <Text style={styles.headerSubtitle}>
          {currentMedia.length} {activeTab === 'audio' ? 'canciones' : 'videos'}
        </Text>
      </View>

      {/* Tab Bar */}
      <CustomTabBar 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
      />

      {/* Media List */}
      <MediaList
        items={currentMedia}
        onItemPress={handleMediaPress}
        type={activeTab}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1DB954"
            colors={['#1DB954']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888888',
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