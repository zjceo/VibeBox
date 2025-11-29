import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import PlaylistService from '../services/PlaylistService';

const PlaylistDetail = ({ playlist, onBack, onItemPress }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        loadItems();
    }, [playlist]);

    const loadItems = async () => {
        try {
            const data = await PlaylistService.getItems(playlist.id);
            setItems(data);
        } catch (error) {
            console.error('Error loading playlist items:', error);
        }
    };

    const handleRemoveItem = (mediaId) => {
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

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => onItemPress(item)}
            onLongPress={() => handleRemoveItem(item.id)}
            activeOpacity={0.7}>
            <Text style={styles.indexText}>{index + 1}</Text>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title || item.name}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {item.artist || 'Desconocido'} • {item.duration ? formatDuration(item.duration) : '--:--'}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.moreButton}
                onPress={() => handleRemoveItem(item.id)}>
                <Text style={styles.moreIcon}>⋮</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{playlist.name}</Text>
                    <Text style={styles.headerSubtitle}>{items.length} canciones</Text>
                </View>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Esta lista está vacía</Text>
                        <Text style={styles.emptySubtext}>Agrega canciones desde el reproductor</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    backIcon: {
        fontSize: 24,
        color: '#ffffff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#888888',
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    indexText: {
        width: 30,
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
        color: '#888888',
    },
    moreButton: {
        padding: 8,
    },
    moreIcon: {
        fontSize: 20,
        color: '#888888',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#ffffff',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888888',
    },
});

export default PlaylistDetail;
