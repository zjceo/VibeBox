import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

interface PlayerControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onSeek: (value: number) => void;
    position?: number;
    duration?: number;
    showSkipButtons?: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
    isPlaying,
    onPlayPause,
    onNext,
    onPrevious,
    onSeek,
    position = 0,
    duration = 0,
    showSkipButtons = true,
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View className="w-full px-6 py-6">
            {/* Progress Bar */}
            <View className="mb-6 bg-[#1a1a1a]/50 rounded-2xl p-4 border border-white/5">
                <Slider
                    className="w-full h-11"
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={onSeek}
                    minimumTrackTintColor="#1DB954"
                    maximumTrackTintColor="#404040"
                    thumbTintColor="#1DB954"
                />
                <View className="flex-row justify-between px-2 mt-1">
                    <Text className="text-[#b3b3b3] text-[13px] font-semibold">{formatTime(position)}</Text>
                    <Text className="text-[#b3b3b3] text-[13px] font-semibold">{formatTime(duration)}</Text>
                </View>
            </View>

            {/* Control Buttons */}
            <View className="flex-row justify-center items-center gap-9 py-2">
                {showSkipButtons && (
                    <TouchableOpacity
                        className="w-[68px] h-[68px] rounded-full bg-[#252525] justify-center items-center border-2 border-white/10 shadow-md"
                        onPress={onPrevious}
                        activeOpacity={0.7}>
                        <Text className="text-[26px] text-white">⏮</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    className="w-[82px] h-[82px] rounded-full bg-[#1DB954] justify-center items-center border-[3px] border-[#1DB954]/30 shadow-lg shadow-[#1DB954]/50"
                    onPress={onPlayPause}
                    activeOpacity={0.7}>
                    <Text className="text-[32px] text-white">
                        {isPlaying ? '⏸' : '▶'}
                    </Text>
                </TouchableOpacity>

                {showSkipButtons && (
                    <TouchableOpacity
                        className="w-[68px] h-[68px] rounded-full bg-[#252525] justify-center items-center border-2 border-white/10 shadow-md"
                        onPress={onNext}
                        activeOpacity={0.7}>
                        <Text className="text-[26px] text-white">⏭</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default PlayerControls;
