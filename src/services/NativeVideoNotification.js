import { NativeModules, NativeEventEmitter } from 'react-native';

const { VideoNotificationModule } = NativeModules;

if (!VideoNotificationModule) {
    console.warn('VideoNotificationModule is not available');
}

const eventEmitter = VideoNotificationModule
    ? new NativeEventEmitter(VideoNotificationModule)
    : null;

const NativeVideoNotification = {
    show: (title, isPlaying) => {
        if (VideoNotificationModule) {
            VideoNotificationModule.showNotification(title, isPlaying);
        }
    },

    hide: () => {
        if (VideoNotificationModule) {
            VideoNotificationModule.hideNotification();
        }
    },

    updateState: (isPlaying) => {
        if (VideoNotificationModule) {
            VideoNotificationModule.updatePlaybackState(isPlaying);
        }
    },

    onPlayPressed: (callback) => {
        if (eventEmitter) {
            return eventEmitter.addListener('onPlayPressed', callback);
        }
        return { remove: () => { } };
    },

    onPausePressed: (callback) => {
        if (eventEmitter) {
            return eventEmitter.addListener('onPausePressed', callback);
        }
        return { remove: () => { } };
    },

    onStopPressed: (callback) => {
        if (eventEmitter) {
            return eventEmitter.addListener('onStopPressed', callback);
        }
        return { remove: () => { } };
    },
};

export default NativeVideoNotification;
