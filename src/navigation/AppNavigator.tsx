import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import AudioListScreen from '../screens/AudioListScreen';
import VideoListScreen from '../screens/VideoListScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import { MediaFile } from '../services/MediaService';

export type RootStackParamList = {
    Main: undefined;
    AudioPlayer: { track: MediaFile; playlist: MediaFile[] };
    VideoPlayer: { video: MediaFile };
};

export type DrawerParamList = {
    AudioList: undefined;
    VideoList: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#121212',
                    width: 240,
                },
                drawerActiveTintColor: '#1DB954',
                drawerInactiveTintColor: '#b3b3b3',
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: -10,
                },
                drawerItemStyle: {
                    borderRadius: 8,
                    marginVertical: 4,
                },
            }}
        >
            <Drawer.Screen
                name="AudioList"
                component={AudioListScreen}
                options={{ title: 'Música', drawerIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎵</Text> }}
            />
            <Drawer.Screen
                name="VideoList"
                component={VideoListScreen}
                options={{ title: 'Videos', drawerIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎬</Text> }}
            />
        </Drawer.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={DrawerNavigator} />
                <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
                <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
