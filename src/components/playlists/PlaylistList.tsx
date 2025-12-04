import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import PlaylistService from '../../services/PlaylistService';
import CreatePlaylistModal from './CreatePlaylistModal';
import { useSettings } from '../../context/SettingsContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = width > 600 ? 4 : 2;
const ITEM_WIDTH = (width - 80 - (COLUMN_COUNT + 1) * 16) / COLUMN_COUNT;

interface Playlist {
    id: string;
    name: string;
    cover_image?: string;
    item_count: number;
}

interface PlaylistWithButton extends Playlist {
    isAddButton?: boolean;
}

interface PlaylistListProps {
    onPlaylistPress: (playlist: Playlist) => void;
    refreshControl?: React.ReactElement;
}

const PlaylistList: React.FC<PlaylistListProps> = ({ onPlaylistPress, refreshControl }) => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const { themeColors } = useSettings();

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async (): Promise<void> => {
        try {
            const data = await PlaylistService.getAll();
            setPlaylists(data);
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    };

    const handleCreatePlaylist = async (name: string): Promise<void> => {
        try {
            await PlaylistService.create(name);
            loadPlaylists();
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la lista de reproducción');
        }
    };

    const handleDeletePlaylist = (id: string, name: string): void => {
        Alert.alert(
            'Eliminar lista',
            `¿Estás seguro de que quieres eliminar "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PlaylistService.delete(id);
                            loadPlaylists();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la lista');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: PlaylistWithButton }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}>
                    <View style={[styles.coverContainer, styles.addContainer, { backgroundColor: themeColors.surfaceHighlight, borderColor: themeColors.border }]}>
                        <Text style={[styles.addIcon, { color: themeColors.textSecondary }]}>+</Text>
                    </View>
                    <Text style={[styles.itemTitle, { color: themeColors.text }]}>Nueva Lista</Text>
                    <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>Crear colección</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => onPlaylistPress(item)}
                onLongPress={() => handleDeletePlaylist(item.id, item.name)}
                activeOpacity={0.7}>
                <View style={[styles.coverContainer, { backgroundColor: themeColors.surfaceHighlight }]}>
                    {item.cover_image ? (
                        <Image source={{ uri: item.cover_image }} style={styles.coverImage} />
                    ) : (
                        <View style={[styles.placeholderCover, { backgroundColor: themeColors.surfaceHighlight }]}>
                            <Text style={styles.placeholderIcon}>🎵</Text>
                        </View>
                    )}
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{item.item_count}</Text>
                    </View>
                </View>
                <Text style={[styles.itemTitle, { color: themeColors.text }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
                    {item.item_count} canciones
                </Text>
            </TouchableOpacity>
        );
    };

    const data: PlaylistWithButton[] = [{ id: 'add', isAddButton: true, name: '', item_count: 0 }, ...playlists];

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                refreshControl={refreshControl}
            />
            <CreatePlaylistModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onCreate={handleCreatePlaylist}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    columnWrapper: {
        gap: 16,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        marginBottom: 24,
    },
    coverContainer: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    placeholderCover: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 32,
    },
    addContainer: {
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 48,
        fontWeight: '300',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
    },
    countBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    countText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default PlaylistList;