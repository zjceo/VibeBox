import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    return (
        <SafeAreaProvider>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'blue' }}>
                <Text style={{ color: 'white', fontSize: 24 }}>AppNew Works!</Text>
            </View>
        </SafeAreaProvider>
    );
}
