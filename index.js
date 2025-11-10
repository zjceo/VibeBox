/**
 * @format
 */

import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';

// Registrar el componente principal
AppRegistry.registerComponent(appName, () => App);

// Registrar el servicio de TrackPlayer para reproducción en segundo plano
TrackPlayer.registerPlaybackService(() => require('./src/services/TrackPlayerService'));