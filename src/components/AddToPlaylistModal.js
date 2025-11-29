import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import PlaylistService from '../services/PlaylistService';
import CreatePlaylistModal from './CreatePlaylistModal';

const AddToPlaylistModal = ({ visible, onClose, track }) => {
    const [playlists, setPlaylists] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (visible) {
            loadPlaylists();
        }
    }, [visible]);

    const loadPlaylists = async () => {
        try {
            const data = await PlaylistService.getAll();
            setPlaylists(data);
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    };

    const handleAddToPlaylist = async (playlist) => {
        try {
            await PlaylistService.addMedia(playlist.id, track.id);
            Alert.alert('Añadido', `Se añadió a "${playlist.name}"`);
            onClose();
        } catch (error) {
            Alert.alert('Error', 'No se pudo añadir a la lista');
        }
    };

    const handleCreatePlaylist = async (name) => {
        try {
            const id = await PlaylistService.create(name);
            await PlaylistService.addMedia(id, track.id);
            Alert.alert('Creada y Añadida', `Se creó "${name}" y se añadió la canción.`);
            setShowCreateModal(false);
            onClose();
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la lista');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleAddToPlaylist(item)}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🎵</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>{item.item_count} canciones</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Añadir a lista</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => setShowCreateModal(true)}>
                        <Text style={styles.createButtonIcon}>+</Text>
                        <Text style={styles.createButtonText}>Nueva lista de reproducción</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={playlists}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            </View>

            <CreatePlaylistModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreatePlaylist}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    closeButton: {
        fontSize: 20,
        color: '#888888',
        padding: 4,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    createButtonIcon: {
        fontSize: 24,
        color: '#1DB954',
        marginRight: 16,
    },
    createButtonText: {
        fontSize: 16,
        color: '#1DB954',
        fontWeight: '600',
    },
    listContent: {
        padding: 0,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#282828',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
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
});

export default AddToPlaylistModal;
