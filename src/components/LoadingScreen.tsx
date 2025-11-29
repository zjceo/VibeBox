import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Cargando...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1DB954" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  text: {
    marginTop: 24,
    fontSize: 18,
    color: '#b3b3b3',
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});

export default LoadingScreen;