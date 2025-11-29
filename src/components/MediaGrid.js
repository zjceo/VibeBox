import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

// Componente de Card memoizado para evitar re-renders innecesarios
const MediaCard = memo(({ item, onPress, type, cardWidth }) => {
  const handlePress = useCallback(() => {
    onPress && onPress(item);
  }, [item, onPress]);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={handlePress}
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
          {formatFileSize(item.size)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambia el item o el ancho
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.cardWidth === nextProps.cardWidth
  );
});

// Componente de header de sección memoizado
const SectionHeader = memo(({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
));

const MediaGrid = ({
  items = [],
  onItemPress,
  type = 'video',
  refreshControl,
  grouped = false
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Calcular dimensiones (memoizado)
  const dimensions = useMemo(() => {
    const sidebarWidth = isLandscape ? 70 : 80;
    const containerPadding = 48;
    const gap = 20;
    const availableWidth = width - sidebarWidth - containerPadding;
    const minCardWidth = 160;
    const numColumns = Math.max(2, Math.floor(availableWidth / (minCardWidth + gap)));
    const cardWidth = (availableWidth - (gap * (numColumns - 1))) / numColumns;

    return { numColumns, cardWidth, gap };
  }, [width, height, isLandscape]);

  // Validar items
  const validItems = useMemo(() => {
    return Array.isArray(items) ? items : [];
  }, [items]);

  // Key extractor memoizado
  const keyExtractor = useCallback((item, index) => {
    return item.id || item.path || `item-${index}`;
  }, []);

  // Render item memoizado
  const renderItem = useCallback(({ item }) => (
    <MediaCard
      item={item}
      onPress={onItemPress}
      type={type}
      cardWidth={dimensions.cardWidth}
    />
  ), [onItemPress, type, dimensions.cardWidth]);

  // Render section header memoizado
  const renderSectionHeader = useCallback(({ section: { title } }) => (
    <SectionHeader title={title} />
  ), []);

  // Empty component memoizado
  const renderEmpty = useCallback(() => (
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
  ), [type]);

  // Get item layout para optimizar scroll (solo para FlatList)
  const getItemLayout = useCallback((data, index) => {
    const itemHeight = dimensions.cardWidth * (9 / 16) + 80; // thumbnail + info
    const row = Math.floor(index / dimensions.numColumns);
    return {
      length: itemHeight,
      offset: itemHeight * row,
      index,
    };
  }, [dimensions.cardWidth, dimensions.numColumns]);

  if (grouped) {
    return (
      <SectionList
        sections={validItems}
        keyExtractor={keyExtractor}
        renderItem={({ item, index, section }) => {
          if (index % dimensions.numColumns !== 0) return null;

          const rowItems = section.data.slice(index, index + dimensions.numColumns);

          return (
            <View style={[styles.row, { gap: dimensions.gap }]}>
              {rowItems.map((rowItem) => (
                <MediaCard
                  key={rowItem.id || rowItem.path}
                  item={rowItem}
                  onPress={onItemPress}
                  type={type}
                  cardWidth={dimensions.cardWidth}
                />
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
        // Optimizaciones de performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        initialNumToRender={5}
        windowSize={10}
      />
    );
  }

  return (
    <FlatList
      key={`grid-${dimensions.numColumns}`}
      data={validItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={dimensions.numColumns}
      contentContainerStyle={validItems.length === 0 ? styles.emptyList : styles.gridContent}
      columnWrapperStyle={validItems.length > 0 ? [styles.row, { gap: dimensions.gap }] : null}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      // Optimizaciones críticas de performance
      removeClippedSubviews={true}
      maxToRenderPerBatch={dimensions.numColumns * 3}
      updateCellsBatchingPeriod={50}
      initialNumToRender={dimensions.numColumns * 5}
      windowSize={10}
      getItemLayout={getItemLayout}
      // Performance boost adicional
      legacyImplementation={false}
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

export default memo(MediaGrid);