import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import MediaService from '../services/MediaService';

const FolderList = ({ onUpdate, refreshControl }) => {
    const [paths, setPaths] = useState([]);
    const [customPaths, setCustomPaths] = useState([]);

    useEffect(() => {
        loadPaths();
    }, []);

    const loadPaths = async () => {
        const allPaths = MediaService.getMediaPaths();
        await MediaService.loadCustomPaths();
        setCustomPaths(MediaService.customPaths);
        setPaths(allPaths);
    };

    const handleAddPath = async () => {
        try {
            const result = await DocumentPicker.pickDirectory();
            if (result) {
                // On Android, the uri might be content://... we need to handle this.
                // For simplicity in this iteration, we'll try to use the uri directly or decode it if possible.
                // Note: Accessing content:// uris directly with RNFS might require extra steps or a different approach
                // like copying files or using a library that supports SAF (Storage Access Framework).
                // However, for many cases, getting the path is what we want.

                let path = result.uri;

                // Basic decoding for Android content URIs to get a usable path if possible
                // This is a best-effort attempt. Real SAF support is more complex.
                if (path.startsWith('content://com.android.externalstorage.documents/tree/primary%3A')) {
                    path = '/storage/emulated/0/' + decodeURIComponent(path.split('primary%3A')[1]);
                }

                const success = await MediaService.addCustomPath(path);
                if (success) {
                    await loadPaths();
                    if (onUpdate) onUpdate();
                    Alert.alert('Éxito', 'Carpeta añadida correctamente');
                } else {
                    Alert.alert('Error', 'La carpeta ya existe o no se pudo añadir');
                }
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, do nothing
            } else {
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
                        onPress={() => handleRemovePath(item)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Carpetas de Medios</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddPath}>
                    <Text style={styles.addButtonText}>+ Añadir Carpeta</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={paths}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay carpetas configuradas</Text>
                }
                refreshControl={refreshControl}
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
    emptyText: {
        color: '#666666',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});

export default FolderList;
