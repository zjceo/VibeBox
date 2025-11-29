import { Event as TrackPlayerEvent } from 'react-native-track-player';

declare module 'react-native-track-player' {
    // Eventos personalizados
    export interface RemoteSeekEvent {
        position: number;
    }

    export interface PlaybackQueueEndedEvent {
        track: number | null;
        position: number;
    }

    export interface PlaybackErrorEvent {
        code: string;
        message: string;
    }

    export interface PlaybackProgressUpdatedEvent {
        position: number;
        duration: number;
        buffered: number;
    }

    export interface PlaybackActiveTrackChangedEvent {
        index: number | null;
        track: Track | null;
    }

    export interface Track {
        id: string;
        url: string;
        title?: string;
        artist?: string;
        album?: string;
        artwork?: string;
        duration?: number;
        [key: string]: any;
    }
}