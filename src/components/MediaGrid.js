import React from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
// Calculamos el ancho de las tarjetas considerando: sidebar (80) + panel (320) + padding lateral (64) + gaps entre tarjetas (40)
const CARD_WIDTH = (width - 80 - 320 - 64 - 40) / 3;

const MediaGrid = ({ items = [], onItemPress, type = 'video', refreshControl, grouped = false }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onItemPress && onItemPress(item)}
      activeOpacity={0.8}>
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        <Text style={styles.thumbnailIcon}>
          {type === 'video' ? '🎬' : '🎵'}
        </Text>

        {/* Play Overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>

        {/* Duration Badge */}
        {item.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name || 'Sin nombre'}
        </Text>
        <Text style={styles.cardSubtitle}>
          {formatFileSize(item.size || 0)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {type === 'video' ? '🎬' : '🎵'}
      </Text>
      <Text style={styles.emptyTitle}>
        No hay {type === 'video' ? 'videos' : 'audios'}
      </Text>
      <Text style={styles.emptySubtitle}>
        Agrega archivos a tu dispositivo
      </Text>
    </View>
  );

  // Validar que items sea un array
  const validItems = Array.isArray(items) ? items : [];

  if (grouped) {
    return (
      <SectionList
        sections={validItems}
        keyExtractor={(item, index) => item.id || `item-${index}`}
        renderItem={({ item, index, section }) => {
          if (index % 3 !== 0) return null;

          const rowItems = section.data.slice(index, index + 3);

          return (
            <View style={styles.row}>
              {rowItems.map((rowItem, idx) => (
                <View key={rowItem.id || `row-item-${idx}`} style={{ width: CARD_WIDTH, marginRight: 20 }}>
                  {renderItem({ item: rowItem })}
                </View>
              ))}
            </View>
          );
        }}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={validItems.length === 0 ? styles.emptyList : styles.gridContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        stickySectionHeadersEnabled={false}
      />
    );
  }

  return (
    <FlatList
      data={validItems}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id || `item-${index}`}
      numColumns={3}
      contentContainerStyle={validItems.length === 0 ? styles.emptyList : styles.gridContent}
      columnWrapperStyle={validItems.length > 0 ? styles.row : null}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    />
  );
};

const styles = StyleSheet.create({
  gridContent: {
    padding: 24,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    marginBottom: 4,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbnailIcon: {
    fontSize: 48,
    opacity: 0.3,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 0.9 }],
  },
  playIcon: {
    fontSize: 24,
    color: '#ffffff',
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardInfo: {
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  sectionHeader: {
    paddingVertical: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default MediaGrid;