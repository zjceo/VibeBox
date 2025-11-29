import DatabaseService from './DatabaseService';
import { MediaFile } from '../types';

export interface Playlist {
    id: string;
    name: string;
    cover_image?: string;
    item_count: number;
    created_at: number;
    updated_at: number;
}

class PlaylistService {
    async create(name: string): Promise<string> {
        return await DatabaseService.createPlaylist(name);
    }

    async delete(id: string): Promise<void> {
        await DatabaseService.deletePlaylist(id);
    }

    async getAll(): Promise<Playlist[]> {
        return await DatabaseService.getPlaylists();
    }

    async getItems(playlistId: string): Promise<MediaFile[]> {
        return await DatabaseService.getPlaylistItems(playlistId);
    }

    async addMedia(playlistId: string, mediaId: string): Promise<void> {
        await DatabaseService.addMediaToPlaylist(playlistId, mediaId);
    }

    async removeMedia(playlistId: string, mediaId: string): Promise<void> {
        await DatabaseService.removeMediaFromPlaylist(playlistId, mediaId);
    }
}

export default new PlaylistService();
