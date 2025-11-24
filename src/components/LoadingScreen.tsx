import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Cargando...' }) => {
    return (
        <View className="flex-1 justify-center items-center bg-[#0a0a0a]">
            <ActivityIndicator size="large" color="#1DB954" />
            <Text className="mt-6 text-lg text-[#b3b3b3] font-semibold tracking-tighter">
                {message}
            </Text>
        </View>
    );
};

export default LoadingScreen;
