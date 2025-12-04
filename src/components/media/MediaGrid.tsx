import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  SectionListData,
  SectionListRenderItem,
  ListRenderItem,
} from 'react-native';
import type { MediaFile } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface MediaCardProps {
  item: MediaFile;
  onPress?: (item: MediaFile) => void;
  type: 'audio' | 'video';
  cardWidth: number;
  themeColors: any;
}

// Componente de Card memoizado
const MediaCard = memo<MediaCardProps>(({ item, onPress, type, cardWidth, themeColors }) => {
  const handlePress = useCallback(() => {
    onPress && onPress(item);
  }, [item, onPress]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const getItemName = (item: MediaFile): string => {
    return item.filename || item.name || item.title || 'Sin nombre';
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={handlePress}
      activeOpacity={0.8}>
      {/* Thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: themeColors.surfaceHighlight }]}>
        <Text style={[styles.thumbnailIcon, { color: themeColors.textTertiary }]}>
          {type === 'video' ? '🎬' : '🎵'}
        </Text>

        {/* Play Overlay */}
        <View style={styles.playOverlay}>
          <View style={[styles.playButton, { backgroundColor: themeColors.primary }]}>
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
        <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={1}>
          {getItemName(item)}
        </Text>
        <Text style={[styles.cardSubtitle, { color: themeColors.textTertiary }]}>
          {formatFileSize(item.size)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.cardWidth === nextProps.cardWidth &&
    prevProps.themeColors === nextProps.themeColors
  );
});

// Componente de header memoizado
interface SectionHeaderProps {
  title: string;
  themeColors: any;
}

const SectionHeader = memo<SectionHeaderProps>(({ title, themeColors }) => (
  <View style={[styles.sectionHeader, { borderBottomColor: themeColors.border }]}>
    <Text style={[styles.sectionHeaderText, { color: themeColors.text }]}>{title}</Text>
  </View>
));

interface MediaSection {
  title: string;
  data: MediaFile[];
}

interface MediaGridProps {
  items?: MediaFile[] | MediaSection[];
  onItemPress?: (item: MediaFile) => void;
  type?: 'audio' | 'video';
  refreshControl?: React.ReactElement;
  grouped?: boolean;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  items = [],
  onItemPress,
  type = 'video',
  refreshControl,
  grouped = false
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { themeColors } = useSettings();

  // Calcular dimensiones
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

  // Key extractor
  const keyExtractor = useCallback((item: MediaFile, index: number) => {
    return item.id || item.path || `item-${index}`;
  }, []);

  // Render item
  const renderItem: ListRenderItem<MediaFile> = useCallback(({ item }) => (
    <MediaCard
      item={item}
      onPress={onItemPress}
      type={type}
      cardWidth={dimensions.cardWidth}
      themeColors={themeColors}
    />
  ), [onItemPress, type, dimensions.cardWidth, themeColors]);

  // Render section header
  const renderSectionHeader = useCallback(({ section }: { section: SectionListData<MediaFile, MediaSection> }) => (
    <SectionHeader title={section.title} themeColors={themeColors} />
  ), [themeColors]);

  // Empty component
  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon, { color: themeColors.textTertiary }]}>
        {type === 'video' ? '🎬' : '🎵'}
      </Text>
      <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
        No hay {type === 'video' ? 'videos' : 'audios'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: themeColors.textTertiary }]}>
        Agrega archivos a tu dispositivo
      </Text>
    </View>
  ), [type, themeColors]);

  // Get item layout
  const getItemLayout = useCallback((data: ArrayLike<MediaFile> | null, index: number) => {
    const itemHeight = dimensions.cardWidth * (9 / 16) + 80;
    const row = Math.floor(index / dimensions.numColumns);
    return {
      length: itemHeight,
      offset: itemHeight * row,
      index,
    };
  }, [dimensions.cardWidth, dimensions.numColumns]);

  if (grouped) {
    const sections = validItems as MediaSection[];

    return (
      <SectionList
        sections={sections}
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
                  themeColors={themeColors}
                />
              ))}
            </View>
          );
        }}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={sections.length === 0 ? styles.emptyList : styles.gridContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        initialNumToRender={5}
        windowSize={10}
      />
    );
  }

  const flatItems = validItems as MediaFile[];

  return (
    <FlatList
      key={`grid-${dimensions.numColumns}`}
      data={flatItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={dimensions.numColumns}
      contentContainerStyle={flatItems.length === 0 ? styles.emptyList : styles.gridContent}
      columnWrapperStyle={flatItems.length > 0 ? [styles.row, { gap: dimensions.gap }] : undefined}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      removeClippedSubviews={true}
      maxToRenderPerBatch={dimensions.numColumns * 3}
      updateCellsBatchingPeriod={50}
      initialNumToRender={dimensions.numColumns * 5}
      windowSize={10}
      getItemLayout={getItemLayout}
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
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
  },
  sectionHeader: {
    paddingVertical: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default memo(MediaGrid);