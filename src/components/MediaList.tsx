import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControlProps,
} from 'react-native';
import { MediaFile } from '../services/MediaService';
import { formatFileSize } from '../utils/helpers';

interface MediaListProps {
    items: MediaFile[];
    onItemPress: (item: MediaFile) => void;
    type?: 'audio' | 'video';
    refreshControl?: React.ReactElement<RefreshControlProps>;
}

const MediaList: React.FC<MediaListProps> = ({ items, onItemPress, type = 'audio', refreshControl }) => {
    const renderItem = ({ item }: { item: MediaFile }) => (
        <TouchableOpacity
            className="flex-row items-center bg-[#1a1a1a] rounded-2xl p-4 mb-3.5 mx-0.5 border border-white/5 shadow-md"
            onPress={() => onItemPress(item)}
            activeOpacity={0.7}>
            <View className="w-14 h-14 rounded-full bg-[#252525] justify-center items-center mr-4 border-2 border-[#1DB954]/20">
                <Text className="text-2xl">
                    {type === 'audio' ? '🎵' : '🎬'}
                </Text>
            </View>

            <View className="flex-1">
                <Text className="text-[17px] font-bold text-white mb-1.5 tracking-tighter" numberOfLines={1}>
                    {item.name}
                </Text>
                <Text className="text-[13px] text-[#9a9a9a] font-medium">
                    {item.extension} • {formatFileSize(item.size)}
                </Text>
            </View>

            <View className="pl-3">
                <Text className="text-lg text-[#1DB954] opacity-70">▶</Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View className="flex-1 justify-center items-center p-10">
            <Text className="text-[80px] mb-6 opacity-50">
                {type === 'audio' ? '🎵' : '🎬'}
            </Text>
            <Text className="text-xl font-bold text-white text-center mb-2.5 tracking-tighter">
                No se encontraron archivos {type === 'audio' ? 'de audio' : 'de video'}
            </Text>
            <Text className="text-sm text-[#888888] text-center">
                Agrega archivos a tu dispositivo para verlos aquí
            </Text>
        </View>
    );

    return (
        <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={items.length === 0 ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : { padding: 16 }}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
        />
    );
};

export default MediaList;
