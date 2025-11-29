import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import MediaService from '../services/MediaService';

const FolderList = ({ onUpdate, refreshControl }) => {
    const [paths, setPaths] = useState([]);
    const [customPaths, setCustomPaths] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPaths();
    }, []);

    const loadPaths = async () => {
        try {
            await MediaService.loadCustomPaths();
            const allPaths = MediaService.getMediaPaths();
            setCustomPaths(MediaService.customPaths);
            setPaths(allPaths);
            console.log('FolderList - Loaded paths:', allPaths);
            console.log('FolderList - Custom paths:', MediaService.customPaths);
        } catch (error) {
            console.error('Error loading paths:', error);
            Alert.alert('Error', 'No se pudieron cargar las carpetas');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPaths();
        setRefreshing(false);
    };

    const handleAddPath = async () => {
        try {
            const result = await DocumentPicker.pickDirectory();
            if (!result || !result.uri) return;

            let path = result.uri;

            if (path.startsWith('content://com.android.externalstorage.documents/tree/primary%3A')) {
                const decoded = decodeURIComponent(path.split('primary%3A')[1]);
                path = '/storage/emulated/0/' + decoded;
            } else if (path.startsWith('content://')) {
                try {
                    const stat = await RNFS.stat(path);
                    path = stat.path || path;
                } catch (e) {
                    console.log('Could not resolve content URI to path:', e);
                }
            }

            const success = await MediaService.addCustomPath(path);
            if (success) {
                await loadPaths();
                if (onUpdate) onUpdate();
                Alert.alert('Éxito', 'Carpeta añadida correctamente');
            } else {
                Alert.alert('Error', 'La carpeta ya existe o no se pudo añadir');
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('User cancelled folder picker');
            } else {
                console.error('Error picking folder:', err);
                Alert.alert('Error', 'No se pudo seleccionar la carpeta: ' + err.message);
            }
        }
    };

    const handleRemovePath = async (path) => {
        Alert.alert(
            'Eliminar carpeta',
            '¿Estás seguro de que quieres eliminar esta carpeta de la lista?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await MediaService.removeCustomPath(path);
                        if (success) {
                            await loadPaths();
                            if (onUpdate) onUpdate();
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isCustom = customPaths.includes(item);
        console.log('FolderList - Rendering item:', item);

        return (
            <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                    <Text style={styles.folderIcon}>📁</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.pathText} numberOfLines={1} ellipsizeMode="middle">
                        {item}
                    </Text>
                    <Text style={styles.typeText}>
                        {isCustom ? 'Personalizada' : 'Sistema'}
                    </Text>
                </View>
                {isCustom && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemovePath(item)}
                        activeOpacity={0.7}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    console.log('FolderList - Rendering with paths.length:', paths.length);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Carpetas de Medios</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddPath}
                    activeOpacity={0.8}>
                    <Text style={styles.addButtonText}>+ Añadir Carpeta</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={paths}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item}-${index}`}
                contentContainerStyle={paths.length === 0 ? styles.emptyListContent : styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📂</Text>
                        <Text style={styles.emptyText}>No hay carpetas configuradas</Text>
                        <Text style={styles.emptySubtext}>
                            Añade carpetas personalizadas para escanear
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#1DB954"
                        colors={['#1DB954']}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    addButton: {
        backgroundColor: '#1DB954',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    folderIcon: {
        fontSize: 20,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    pathText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '500',
        marginBottom: 4,
    },
    typeText: {
        fontSize: 12,
        color: '#666666',
    },
    deleteButton: {
        padding: 8,
    },
    deleteIcon: {
        fontSize: 18,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        opacity: 0.3,
    },
    emptyText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#666666',
        textAlign: 'center',
        fontSize: 14,
    },
});

export default FolderList;