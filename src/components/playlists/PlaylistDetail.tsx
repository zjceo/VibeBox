import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import PlaylistService from '../../services/PlaylistService';
import { useSettings } from '../../context/SettingsContext';

interface Playlist {
    id: string;
    name: string;
}

interface MediaItem {
    id: string;
    title?: string;
    name?: string;
    artist?: string;
    duration?: number;
}

interface PlaylistDetailProps {
    playlist: Playlist;
    onBack: () => void;
    onItemPress: (item: MediaItem) => void;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist, onBack, onItemPress }) => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const { themeColors } = useSettings();

    useEffect(() => {
        loadItems();
    }, [playlist]);

    const loadItems = async (): Promise<void> => {
        try {
            const data = await PlaylistService.getItems(playlist.id);
            setItems(data);
        } catch (error) {
            console.error('Error loading playlist items:', error);
        }
    };

    const handleRemoveItem = (mediaId: string): void => {
        Alert.alert(
            'Quitar canción',
            '¿Quieres quitar esta canción de la lista?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Quitar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PlaylistService.removeMedia(playlist.id, mediaId);
                            loadItems();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo quitar la canción');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item, index }: { item: MediaItem; index: number }) => (
        <TouchableOpacity
            style={[styles.itemContainer, { borderBottomColor: themeColors.border }]}
            onPress={() => onItemPress(item)}
            onLongPress={() => handleRemoveItem(item.id)}
            activeOpacity={0.7}>
            <Text style={[styles.indexText, { color: themeColors.textSecondary }]}>{index + 1}</Text>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: themeColors.text }]} numberOfLines={1}>
                    {item.title || item.name}
                </Text>
                <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]} numberOfLines={1}>
                    {item.artist || 'Desconocido'} • {item.duration ? formatDuration(item.duration) : '--:--'}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.moreButton}
                onPress={() => handleRemoveItem(item.id)}>
                <Text style={[styles.moreIcon, { color: themeColors.textSecondary }]}>⋮</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const formatDuration = (seconds: number): string => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={[styles.backIcon, { color: themeColors.text }]}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: themeColors.text }]}>{playlist.name}</Text>
                    <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>{items.length} canciones</Text>
                </View>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: themeColors.text }]}>Esta lista está vacía</Text>
                        <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>Agrega canciones desde el reproductor</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    backIcon: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    indexText: {
        width: 30,
        fontSize: 14,
        textAlign: 'center',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
    },
    moreButton: {
        padding: 8,
    },
    moreIcon: {
        fontSize: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
    },
});

export default PlaylistDetail;