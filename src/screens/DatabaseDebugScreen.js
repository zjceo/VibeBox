import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    FlatList,
} from 'react-native';
import DatabaseService from '../services/DatabaseService';
import MediaService from '../services/MediaService';

const DatabaseDebugScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [cacheStats, setCacheStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('stats'); // stats, search, actions

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [dbStats, mediaCache] = await Promise.all([
                DatabaseService.getDatabaseStats(),
                MediaService.getCacheStats(),
            ]);
            setStats(dbStats);
            setCacheStats(mediaCache);
        } catch (error) {
            console.error('Error loading stats:', error);
            Alert.alert('Error', 'No se pudieron cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.trim().length < 2) {
            Alert.alert('Búsqueda', 'Ingresa al menos 2 caracteres');
            return;
        }

        try {
            setSearching(true);
            const results = await DatabaseService.searchFiles(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Error en la búsqueda');
        } finally {
            setSearching(false);
        }
    };

    const handleClearCache = () => {
        Alert.alert(
            'Limpiar Caché',
            '¿Estás seguro? Esto eliminará todos los datos en caché y requerirá un nuevo escaneo.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpiar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await MediaService.clearCache();
                            Alert.alert('Éxito', 'Caché limpiado correctamente');
                            await loadStats();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo limpiar el caché');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleOptimizeDB = async () => {
        try {
            setLoading(true);
            await DatabaseService.optimizeDatabase();
            Alert.alert('Éxito', 'Base de datos optimizada');
            await loadStats();
        } catch (error) {
            Alert.alert('Error', 'No se pudo optimizar la base de datos');
        } finally {
            setLoading(false);
        }
    };

    const handleResetDB = () => {
        Alert.alert(
            '⚠️ Resetear Base de Datos',
            'ADVERTENCIA: Esto eliminará TODA la base de datos y requerirá un escaneo completo. ¿Continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Resetear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await DatabaseService.resetDatabase();
                            Alert.alert('Éxito', 'Base de datos reseteada. Reinicia la app.');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo resetear la base de datos');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    const renderSearchItem = ({ item }) => (
        <View style={styles.searchItem}>
            <View style={styles.searchItemHeader}>
                <Text style={styles.searchItemName} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={[styles.typeBadge, item.type === 'audio' ? styles.audioBadge : styles.videoBadge]}>
                    <Text style={styles.typeBadgeText}>{item.type === 'audio' ? '🎵' : '🎬'}</Text>
                </View>
            </View>
            <Text style={styles.searchItemPath} numberOfLines={1}>
                {item.path}
            </Text>
            <View style={styles.searchItemFooter}>
                <Text style={styles.searchItemDetail}>{item.extension}</Text>
                <Text style={styles.searchItemDetail}>{formatFileSize(item.size)}</Text>
            </View>
        </View>
    );

    if (loading && !stats) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.loadingText}>Cargando estadísticas...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Database Debug</Text>
                <TouchableOpacity onPress={loadStats} style={styles.refreshButton}>
                    <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
                    onPress={() => setActiveTab('stats')}>
                    <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
                        Estadísticas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'search' && styles.tabActive]}
                    onPress={() => setActiveTab('search')}>
                    <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
                        Búsqueda
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'actions' && styles.tabActive]}
                    onPress={() => setActiveTab('actions')}>
                    <Text style={[styles.tabText, activeTab === 'actions' && styles.tabTextActive]}>
                        Acciones
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <View style={styles.tabContent}>
                        {/* Database Stats */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📊 Estadísticas de Base de Datos</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{stats?.total || 0}</Text>
                                    <Text style={styles.statLabel}>Total Archivos</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={[styles.statValue, styles.audioColor]}>{stats?.audio || 0}</Text>
                                    <Text style={styles.statLabel}>Audio</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={[styles.statValue, styles.videoColor]}>{stats?.video || 0}</Text>
                                    <Text style={styles.statLabel}>Video</Text>
                                </View>
                            </View>
                        </View>

                        {/* Cache Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>💾 Información de Caché</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Estado:</Text>
                                    <View style={[styles.statusBadge, cacheStats?.isValid ? styles.validBadge : styles.invalidBadge]}>
                                        <Text style={styles.statusText}>
                                            {cacheStats?.isValid ? '✓ Válido' : '✗ Expirado'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Última actualización:</Text>
                                    <Text style={styles.infoValue}>
                                        {cacheStats?.cacheDate ? formatDate(cacheStats.cacheDate) : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Archivos en caché:</Text>
                                    <Text style={styles.infoValue}>{cacheStats?.totalFiles || 0}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Database Version */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🔧 Información Técnica</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Versión DB:</Text>
                                    <Text style={styles.infoValue}>2.0</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Nombre:</Text>
                                    <Text style={styles.infoValue}>VibeBox.db</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Tablas:</Text>
                                    <Text style={styles.infoValue}>media_files, folders, cache_metadata, db_version</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <View style={styles.tabContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🔍 Buscar en Base de Datos</Text>
                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar archivos..."
                                    placeholderTextColor="#666"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleSearch}
                                />
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={handleSearch}
                                    disabled={searching}>
                                    {searching ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.searchButtonText}>Buscar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {searchResults.length > 0 && (
                                <>
                                    <Text style={styles.resultsCount}>
                                        {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                                    </Text>
                                    <FlatList
                                        data={searchResults}
                                        keyExtractor={(item) => item.id}
                                        renderItem={renderSearchItem}
                                        scrollEnabled={false}
                                    />
                                </>
                            )}

                            {searchQuery.length > 0 && searchResults.length === 0 && !searching && (
                                <View style={styles.emptySearch}>
                                    <Text style={styles.emptySearchText}>No se encontraron resultados</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Actions Tab */}
                {activeTab === 'actions' && (
                    <View style={styles.tabContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>⚡ Acciones de Mantenimiento</Text>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleOptimizeDB}
                                disabled={loading}>
                                <Text style={styles.actionIcon}>🔧</Text>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Optimizar Base de Datos</Text>
                                    <Text style={styles.actionDescription}>
                                        Ejecuta VACUUM y ANALYZE para mejorar el rendimiento
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleClearCache}
                                disabled={loading}>
                                <Text style={styles.actionIcon}>🗑️</Text>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Limpiar Caché</Text>
                                    <Text style={styles.actionDescription}>
                                        Elimina todos los datos en caché (requiere nuevo escaneo)
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.dangerButton]}
                                onPress={handleResetDB}
                                disabled={loading}>
                                <Text style={styles.actionIcon}>⚠️</Text>
                                <View style={styles.actionContent}>
                                    <Text style={[styles.actionTitle, styles.dangerText]}>Resetear Base de Datos</Text>
                                    <Text style={styles.actionDescription}>
                                        PELIGRO: Elimina toda la base de datos y la recrea desde cero
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshIcon: {
        fontSize: 20,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#1DB954',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActive: {
        color: '#1DB954',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1DB954',
        marginBottom: 4,
    },
    audioColor: {
        color: '#FF6B6B',
    },
    videoColor: {
        color: '#4ECDC4',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    infoLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    validBadge: {
        backgroundColor: 'rgba(29, 185, 84, 0.2)',
    },
    invalidBadge: {
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 15,
    },
    searchButton: {
        backgroundColor: '#1DB954',
        borderRadius: 12,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    resultsCount: {
        fontSize: 13,
        color: '#888',
        marginBottom: 12,
        fontWeight: '600',
    },
    searchItem: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    searchItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    searchItemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    audioBadge: {
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
    },
    videoBadge: {
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
    },
    typeBadgeText: {
        fontSize: 12,
    },
    searchItemPath: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    searchItemFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    searchItemDetail: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    emptySearch: {
        padding: 40,
        alignItems: 'center',
    },
    emptySearchText: {
        fontSize: 14,
        color: '#666',
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    dangerButton: {
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    actionIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    dangerText: {
        color: '#FF6B6B',
    },
    actionDescription: {
        fontSize: 13,
        color: '#888',
    },
});

export default DatabaseDebugScreen;
