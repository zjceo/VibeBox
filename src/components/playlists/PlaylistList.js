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

const { width } = Dimensions.get('window');
const COLUMN_COUNT = width > 600 ? 4 : 2;
const ITEM_WIDTH = (width - 80 - (COLUMN_COUNT + 1) * 16) / COLUMN_COUNT;

const PlaylistList = ({ onPlaylistPress, refreshControl }) => {
    const [playlists, setPlaylists] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        try {
            const data = await PlaylistService.getAll();
            setPlaylists(data);
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    };

    const handleCreatePlaylist = async (name) => {
        try {
            await PlaylistService.create(name);
            loadPlaylists();
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la lista de reproducción');
        }
    };

    const handleDeletePlaylist = (id, name) => {
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

    const renderItem = ({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}>
                    <View style={[styles.coverContainer, styles.addContainer]}>
                        <Text style={styles.addIcon}>+</Text>
                    </View>
                    <Text style={styles.itemTitle}>Nueva Lista</Text>
                    <Text style={styles.itemSubtitle}>Crear colección</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => onPlaylistPress(item)}
                onLongPress={() => handleDeletePlaylist(item.id, item.name)}
                activeOpacity={0.7}>
                <View style={styles.coverContainer}>
                    {item.cover_image ? (
                        <Image source={{ uri: item.cover_image }} style={styles.coverImage} />
                    ) : (
                        <View style={styles.placeholderCover}>
                            <Text style={styles.placeholderIcon}>🎵</Text>
                        </View>
                    )}
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{item.item_count}</Text>
                    </View>
                </View>
                <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.itemSubtitle}>
                    {item.item_count} canciones
                </Text>
            </TouchableOpacity>
        );
    };

    const data = [{ id: 'add', isAddButton: true }, ...playlists];

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
        backgroundColor: '#282828',
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
        backgroundColor: '#282828',
    },
    placeholderIcon: {
        fontSize: 32,
    },
    addContainer: {
        backgroundColor: '#1a1a1a',
        borderWidth: 2,
        borderColor: '#333',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 48,
        color: '#666',
        fontWeight: '300',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#888888',
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
