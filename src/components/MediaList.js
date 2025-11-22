import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';

const MediaList = ({ items, onItemPress, type = 'audio', refreshControl }) => {
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress(item)}
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          {type === 'audio' ? '🎵' : '🎬'}
        </Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.subtitle}>
          {item.extension} • {formatFileSize(item.size)}
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>▶</Text>
      </View>
    </TouchableOpacity>
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {type === 'audio' ? '🎵' : '🎬'}
      </Text>
      <Text style={styles.emptyText}>
        No se encontraron archivos {type === 'audio' ? 'de audio' : 'de video'}
      </Text>
      <Text style={styles.emptySubtext}>
        Agrega archivos a tu dispositivo para verlos aquí
      </Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(29, 185, 84, 0.2)',
  },
  icon: {
    fontSize: 26,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#9a9a9a',
    fontWeight: '500',
  },
  arrowContainer: {
    paddingLeft: 12,
  },
  arrow: {
    fontSize: 18,
    color: '#1DB954',
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});

export default MediaList;