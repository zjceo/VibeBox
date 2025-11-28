// src/services/playbackService.js
import TrackPlayer, { Event, Capability } from 'react-native-track-player';

module.exports = async function () {
    // Este servicio se ejecuta en segundo plano
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());

    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());

    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
        TrackPlayer.seekTo(event.position);
    });
};