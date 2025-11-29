import DatabaseService from './DatabaseService';
import { MediaFile } from '../types';

class FavoritesService {
    async add(mediaId: string): Promise<void> {
        await DatabaseService.addToFavorites(mediaId);
    }

    async remove(mediaId: string): Promise<void> {
        await DatabaseService.removeFromFavorites(mediaId);
    }

    async isFavorite(mediaId: string): Promise<boolean> {
        return await DatabaseService.isFavorite(mediaId);
    }

    async getAll(): Promise<MediaFile[]> {
        return await DatabaseService.getFavorites();
    }

    async toggle(mediaId: string): Promise<boolean> {
        const isFav = await this.isFavorite(mediaId);
        if (isFav) {
            await this.remove(mediaId);
            return false;
        } else {
            await this.add(mediaId);
            return true;
        }
    }
}

export default new FavoritesService();
