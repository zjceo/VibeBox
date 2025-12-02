// src/services/DatabaseService.ts
import SQLite, { SQLiteDatabase, ResultSet } from 'react-native-sqlite-storage';
import type { MediaFile, DatabaseStats } from '../types';

SQLite.enablePromise(true);

const database_name = "VibeBox.db";
const database_version = "3.0";
const database_displayname = "VibeBox Database";
const database_size = 200000;

interface DbMediaFile {
    id: string;
    path: string;
    name: string;
    title: string;
    size: number;
    duration: string;
    type: 'audio' | 'video';
    extension: string;
    created_at: number;
    updated_at: number;
}

class DatabaseService {
    private db: SQLiteDatabase | null = null;
    private initPromise: Promise<void> | null = null;
    private currentVersion = 5;

    async init(): Promise<void> {
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                this.db = await SQLite.openDatabase(
                    database_name,
                    database_version,
                    database_displayname,
                    database_size
                );

                // ✅ PRIMERO: Crear estructura básica
                await this.createBasicStructure();
                
                // ✅ SEGUNDO: Migrar si es necesario
                await this.checkAndMigrate();
                
                // ✅ TERCERO: Crear índices y tablas auxiliares
                await this.createIndexesAndExtraTables();
                
                console.log("✅ Database initialized successfully");
                resolve();
            } catch (error) {
                console.error("❌ Database initialization failed:", error);
                reject(error);
            }
        });

        return this.initPromise;
    }

    private async createBasicStructure(): Promise<void> {
        if (!this.db) return;

        try {
            // Tabla de versión
            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS db_version (
                    version INTEGER PRIMARY KEY
                );
            `);

            // Tabla principal (estructura mínima v1)
            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS media_files (
                    id TEXT PRIMARY KEY,
                    path TEXT NOT NULL UNIQUE,
                    name TEXT,
                    size INTEGER,
                    duration TEXT,
                    type TEXT NOT NULL,
                    extension TEXT,
                    created_at INTEGER DEFAULT 0
                );
            `);

            console.log("✅ Basic structure created");
        } catch (error) {
            console.error("❌ Error creating basic structure:", error);
            throw error;
        }
    }

    private async checkAndMigrate(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        try {
            const [versionResult] = await this.db.executeSql(`SELECT version FROM db_version;`);
            
            let currentDbVersion = 1;
            if (versionResult.rows.length === 0) {
                await this.db.executeSql(`INSERT INTO db_version (version) VALUES (1);`);
            } else {
                currentDbVersion = versionResult.rows.item(0).version;
            }

            console.log(`📊 Current DB version: ${currentDbVersion}, Target: ${this.currentVersion}`);

            if (currentDbVersion < this.currentVersion) {
                await this.migrate(currentDbVersion, this.currentVersion);
            }
        } catch (error) {
            console.error("❌ Error in migration check:", error);
            // Si falla es primera vez, ya tenemos estructura básica
            console.log("ℹ️ First time setup, skipping migration");
        }
    }

    private async migrate(fromVersion: number, toVersion: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log(`🔄 Migrating database from v${fromVersion} to v${toVersion}...`);

        try {
            if (fromVersion < 2 && toVersion >= 2) {
                await this.migrateV1ToV2();
            }
            if (fromVersion < 3 && toVersion >= 3) {
                await this.migrateV2ToV3();
            }
            if (fromVersion < 4 && toVersion >= 4) {
                await this.migrateV3ToV4();
            }
            if (fromVersion < 5 && toVersion >= 5) {
                await this.migrateV4ToV5();
            }

            await this.db.executeSql(`UPDATE db_version SET version = ?;`, [toVersion]);
            console.log(`✅ Migration completed to v${toVersion}`);
        } catch (error) {
            console.error("❌ Migration failed:", error);
            throw error;
        }
    }

    private async migrateV1ToV2(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log("🔄 Migrating v1 -> v2: Adding updated_at column...");

        try {
            const [columnCheck] = await this.db.executeSql(`PRAGMA table_info(media_files);`);
            let hasUpdatedAt = false;

            for (let i = 0; i < columnCheck.rows.length; i++) {
                const column = columnCheck.rows.item(i);
                if (column.name === 'updated_at') {
                    hasUpdatedAt = true;
                    break;
                }
            }

            if (!hasUpdatedAt) {
                await this.db.executeSql(`
                    ALTER TABLE media_files 
                    ADD COLUMN updated_at INTEGER DEFAULT 0;
                `);

                await this.db.executeSql(`
                    UPDATE media_files 
                    SET updated_at = created_at 
                    WHERE updated_at = 0;
                `);

                console.log("✅ Column updated_at added successfully");
            } else {
                console.log("ℹ️ Column updated_at already exists, skipping");
            }
        } catch (error) {
            console.error("❌ Error in v1->v2 migration:", error);
            throw error;
        }
    }

    private async migrateV2ToV3(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log("🔄 Migrating v2 -> v3: Adding title column...");

        try {
            const [columnCheck] = await this.db.executeSql(`PRAGMA table_info(media_files);`);
            let hasTitle = false;

            for (let i = 0; i < columnCheck.rows.length; i++) {
                const column = columnCheck.rows.item(i);
                if (column.name === 'title') {
                    hasTitle = true;
                    break;
                }
            }

            if (!hasTitle) {
                await this.db.executeSql(`
                    ALTER TABLE media_files 
                    ADD COLUMN title TEXT;
                `);

                await this.db.executeSql(`
                    UPDATE media_files 
                    SET title = name 
                    WHERE title IS NULL;
                `);

                console.log("✅ Column title added successfully");
            } else {
                console.log("ℹ️ Column title already exists, skipping");
            }
        } catch (error) {
            console.error("❌ Error in v2->v3 migration:", error);
            throw error;
        }
    }

    private async migrateV3ToV4(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log("🔄 Migrating v3 -> v4: Creating favorites table...");

        try {
            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS favorites (
                    media_id TEXT PRIMARY KEY,
                    created_at INTEGER DEFAULT 0,
                    FOREIGN KEY (media_id) REFERENCES media_files (id) ON DELETE CASCADE
                );
            `);
            console.log("✅ Favorites table created successfully");
        } catch (error) {
            console.error("❌ Error in v3->v4 migration:", error);
            throw error;
        }
    }

    private async migrateV4ToV5(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log("🔄 Migrating v4 -> v5: Creating playlists tables...");

        try {
            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS playlists (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    cover_image TEXT,
                    created_at INTEGER DEFAULT 0,
                    updated_at INTEGER DEFAULT 0
                );
            `);

            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS playlist_items (
                    id TEXT PRIMARY KEY,
                    playlist_id TEXT NOT NULL,
                    media_id TEXT NOT NULL,
                    position INTEGER DEFAULT 0,
                    added_at INTEGER DEFAULT 0,
                    FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
                    FOREIGN KEY (media_id) REFERENCES media_files (id) ON DELETE CASCADE
                );
            `);
            console.log("✅ Playlists tables created successfully");
        } catch (error) {
            console.error("❌ Error in v4->v5 migration:", error);
            throw error;
        }
    }

    private async createIndexesAndExtraTables(): Promise<void> {
        if (!this.db) return;

        try {
            // Índices
            await this.db.executeSql(`
                CREATE INDEX IF NOT EXISTS idx_media_type ON media_files (type);
            `);
            await this.db.executeSql(`
                CREATE INDEX IF NOT EXISTS idx_media_name ON media_files (name);
            `);

            try {
                await this.db.executeSql(`
                    CREATE INDEX IF NOT EXISTS idx_media_updated ON media_files (updated_at);
                `);
            } catch (e) {
                console.log("ℹ️ Skipping updated_at index (column may not exist yet)");
            }

            // Tablas auxiliares
            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS folders (
                    path TEXT PRIMARY KEY,
                    is_custom INTEGER DEFAULT 0,
                    created_at INTEGER DEFAULT 0
                );
            `);

            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS cache_metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at INTEGER DEFAULT 0
                );
            `);

            console.log("✅ Indexes and extra tables created");
        } catch (error) {
            console.error("❌ Error creating indexes/tables:", error);
            throw error;
        }
    }

    async getMediaFiles(): Promise<MediaFile[]> {
        await this.init();
        if (!this.db) return [];

        try {
            const [results] = await this.db.executeSql(
                `SELECT * FROM media_files ORDER BY name ASC`
            );

            const files: MediaFile[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i) as DbMediaFile;
                files.push({
                    id: item.id,
                    filename: item.name,
                    name: item.name,
                    title: item.title || item.name,
                    path: item.path,
                    extension: item.extension,
                    type: item.type,
                    size: item.size,
                    dateAdded: item.created_at,
                    lastModified: item.updated_at,
                });
            }

            console.log(`🔍 Loaded ${files.length} files from database`);
            return files;
        } catch (error) {
            console.error("❌ Error getting media files:", error);
            return [];
        }
    }

    async getMediaFilesByType(type: 'audio' | 'video'): Promise<MediaFile[]> {
        await this.init();
        if (!this.db) return [];

        try {
            const [results] = await this.db.executeSql(
                `SELECT * FROM media_files WHERE type = ? ORDER BY name ASC`,
                [type]
            );

            const files: MediaFile[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i) as DbMediaFile;
                files.push({
                    id: item.id,
                    filename: item.name,
                    name: item.name,
                    title: item.title || item.name,
                    path: item.path,
                    extension: item.extension,
                    type: item.type,
                    size: item.size,
                    dateAdded: item.created_at,
                    lastModified: item.updated_at,
                });
            }

            return files;
        } catch (error) {
            console.error(`❌ Error getting ${type} files:`, error);
            return [];
        }
    }

    async saveMediaFiles(files: MediaFile[]): Promise<void> {
        await this.init();
        if (!this.db || !files || files.length === 0) return;

        const BATCH_SIZE = 100;
        const totalBatches = Math.ceil(files.length / BATCH_SIZE);

        try {
            console.log(`💾 Saving ${files.length} files in ${totalBatches} batches...`);
            const startTime = Date.now();

            await this.db.executeSql('DELETE FROM media_files');

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const start = batchIndex * BATCH_SIZE;
                const end = Math.min(start + BATCH_SIZE, files.length);
                const batch = files.slice(start, end);

                await this.db.transaction(async (tx) => {
                    const promises = batch.map(file =>
                        tx.executeSql(
                            `INSERT OR REPLACE INTO media_files 
                            (id, path, name, title, size, duration, type, extension, created_at, updated_at) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                file.id,
                                file.path,
                                file.filename,
                                file.title || file.name || file.filename,
                                file.size || 0,
                                file.duration?.toString() || '',
                                file.type,
                                file.extension || '',
                                file.dateAdded || Date.now(),
                                Date.now()
                            ]
                        )
                    );

                    await Promise.all(promises);
                });

                if (batchIndex % 5 === 0 || batchIndex === totalBatches - 1) {
                    const progress = ((batchIndex + 1) / totalBatches * 100).toFixed(0);
                    console.log(`💾 Progress: ${progress}% (${end}/${files.length} files)`);
                }
            }

            const saveTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Saved ${files.length} files in ${saveTime}s`);
        } catch (error) {
            console.error("❌ Error saving media files:", error);
            throw error;
        }
    }

    async clearCache(): Promise<void> {
        await this.init();
        if (!this.db) return;

        try {
            await this.db.transaction(async (tx) => {
                await tx.executeSql('DELETE FROM media_files');
                await tx.executeSql('DELETE FROM cache_metadata');
                await tx.executeSql('DELETE FROM favorites');
                await tx.executeSql('DELETE FROM playlist_items');
                await tx.executeSql('DELETE FROM playlists');
            });
            console.log("✅ Cache cleared");
        } catch (error) {
            console.error("❌ Error clearing cache:", error);
        }
    }

    async getDatabaseStats(): Promise<DatabaseStats> {
        await this.init();
        if (!this.db) {
            return {
                totalRecords: 0,
                audioCount: 0,
                videoCount: 0,
                databaseSize: 0,
                lastUpdate: 0,
                version: this.currentVersion,
            };
        }

        try {
            const [totalResult] = await this.db.executeSql(
                `SELECT COUNT(*) as total FROM media_files`
            );
            const [audioResult] = await this.db.executeSql(
                `SELECT COUNT(*) as count FROM media_files WHERE type = 'audio'`
            );
            const [videoResult] = await this.db.executeSql(
                `SELECT COUNT(*) as count FROM media_files WHERE type = 'video'`
            );

            return {
                totalRecords: totalResult.rows.item(0).total,
                audioCount: audioResult.rows.item(0).count,
                videoCount: videoResult.rows.item(0).count,
                databaseSize: 0,
                lastUpdate: Date.now(),
                version: this.currentVersion,
            };
        } catch (error) {
            console.error("❌ Error getting database stats:", error);
            return {
                totalRecords: 0,
                audioCount: 0,
                videoCount: 0,
                databaseSize: 0,
                lastUpdate: 0,
                version: this.currentVersion,
            };
        }
    }

    async searchFiles(query: string): Promise<MediaFile[]> {
        await this.init();
        if (!this.db) return [];

        try {
            const [results] = await this.db.executeSql(
                `SELECT * FROM media_files 
                WHERE name LIKE ? OR title LIKE ?
                ORDER BY name ASC 
                LIMIT 50`,
                [`%${query}%`, `%${query}%`]
            );

            const files: MediaFile[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i) as DbMediaFile;
                files.push({
                    id: item.id,
                    filename: item.name,
                    name: item.name,
                    title: item.title || item.name,
                    path: item.path,
                    extension: item.extension,
                    type: item.type,
                    size: item.size,
                    dateAdded: item.created_at,
                    lastModified: item.updated_at,
                });
            }
            return files;
        } catch (error) {
            console.error("❌ Error searching files:", error);
            return [];
        }
    }

    async resetDatabase(): Promise<void> {
        try {
            console.log("🔨 Resetting database...");

            if (this.db) {
                await this.db.close();
                this.db = null;
                this.initPromise = null;
            }

            await SQLite.deleteDatabase({
                name: database_name,
                location: 'default',
            });

            console.log("✅ Database reset completed. Reinitializing...");
            await this.init();
        } catch (error) {
            console.error("❌ Error resetting database:", error);
            throw error;
        }
    }

    // ==================== FAVORITES ====================
    async addToFavorites(mediaId: string): Promise<void> {
        await this.init();
        if (!this.db) return;

        try {
            await this.db.executeSql(
                `INSERT OR IGNORE INTO favorites (media_id, created_at) VALUES (?, ?)`,
                [mediaId, Date.now()]
            );
            console.log(`❤️ Added to favorites: ${mediaId}`);
        } catch (error) {
            console.error("❌ Error adding to favorites:", error);
            throw error;
        }
    }

    async removeFromFavorites(mediaId: string): Promise<void> {
        await this.init();
        if (!this.db) return;

        try {
            await this.db.executeSql(
                `DELETE FROM favorites WHERE media_id = ?`,
                [mediaId]
            );
            console.log(`💔 Removed from favorites: ${mediaId}`);
        } catch (error) {
            console.error("❌ Error removing from favorites:", error);
            throw error;
        }
    }

    async isFavorite(mediaId: string): Promise<boolean> {
        await this.init();
        if (!this.db) return false;

        try {
            const [results] = await this.db.executeSql(
                `SELECT 1 FROM favorites WHERE media_id = ?`,
                [mediaId]
            );
            return results.rows.length > 0;
        } catch (error) {
            console.error("❌ Error checking favorite status:", error);
            return false;
        }
    }

    async getFavorites(): Promise<MediaFile[]> {
        await this.init();
        if (!this.db) return [];

        try {
            const [results] = await this.db.executeSql(
                `SELECT m.* FROM media_files m
                 INNER JOIN favorites f ON m.id = f.media_id
                 ORDER BY f.created_at DESC`
            );

            const files: MediaFile[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i) as DbMediaFile;
                files.push({
                    id: item.id,
                    filename: item.name,
                    name: item.name,
                    title: item.title || item.name,
                    path: item.path,
                    extension: item.extension,
                    type: item.type,
                    size: item.size,
                    dateAdded: item.created_at,
                    lastModified: item.updated_at,
                });
            }

            return files;
        } catch (error) {
            console.error("❌ Error getting favorites:", error);
            return [];
        }
    }

    // ==================== PLAYLISTS ====================
    async createPlaylist(name: string): Promise<string> {
        await this.init();
        if (!this.db) throw new Error("Database not initialized");

        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const now = Date.now();

        try {
            await this.db.executeSql(
                `INSERT INTO playlists (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
                [id, name, now, now]
            );
            console.log(`✅ Playlist created: ${name} (${id})`);
            return id;
        } catch (error) {
            console.error("❌ Error creating playlist:", error);
            throw error;
        }
    }

    async deletePlaylist(id: string): Promise<void> {
        await this.init();
        if (!this.db) return;

        try {
            await this.db.executeSql(`DELETE FROM playlists WHERE id = ?`, [id]);
            console.log(`🗑️ Playlist deleted: ${id}`);
        } catch (error) {
            console.error("❌ Error deleting playlist:", error);
            throw error;
        }
    }

    async getPlaylists(): Promise<any[]> {
        await this.init();
        if (!this.db) return [];

        try {
            const [results] = await this.db.executeSql(
                `SELECT p.*, COUNT(pi.id) as item_count 
                 FROM playlists p
                 LEFT JOIN playlist_items pi ON p.id = pi.playlist_id
                 GROUP BY p.id
                 ORDER BY p.created_at DESC`
            );

            const playlists = [];
            for (let i = 0; i < results.rows.length; i++) {
                playlists.push(results.rows.item(i));
            }
            return playlists;
        } catch (error) {
            console.error("❌ Error getting playlists:", error);
            return [];
        }
    }

    async getPlaylistItems(playlistId: string): Promise<MediaFile[]> {
        await this.init();
        if (!this.db) return [];

        try {
            const [results] = await this.db.executeSql(
                `SELECT m.* FROM media_files m
                 INNER JOIN playlist_items pi ON m.id = pi.media_id
                 WHERE pi.playlist_id = ?
                 ORDER BY pi.position ASC, pi.added_at ASC`,
                [playlistId]
            );

            const files: MediaFile[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i) as DbMediaFile;
                files.push({
                    id: item.id,
                    filename: item.name,
                    name: item.name,
                    title: item.title || item.name,
                    path: item.path,
                    extension: item.extension,
                    type: item.type,
                    size: item.size,
                    dateAdded: item.created_at,
                    lastModified: item.updated_at,
                });
            }
            return files;
        } catch (error) {
            console.error("❌ Error getting playlist items:", error);
            return [];
        }
    }

    async addMediaToPlaylist(playlistId: string, mediaId: string): Promise<void> {
        await this.init();
        if (!this.db) return;

        const id = Math.random().toString(36).substring(2, 15);
        const now = Date.now();

        try {
            const [posResult] = await this.db.executeSql(
                `SELECT MAX(position) as maxPos FROM playlist_items WHERE playlist_id = ?`,
                [playlistId]
            );
            const position = (posResult.rows.item(0).maxPos || 0) + 1;

            await this.db.executeSql(
                `INSERT INTO playlist_items (id, playlist_id, media_id, position, added_at) VALUES (?, ?, ?, ?, ?)`,
                [id, playlistId, mediaId, position, now]
            );

            await this.db.executeSql(
                `UPDATE playlists SET updated_at = ? WHERE id = ?`,
                [now, playlistId]
            );

            console.log(`✅ Added media ${mediaId} to playlist ${playlistId}`);
        } catch (error) {
            console.error("❌ Error adding to playlist:", error);
            throw error;
        }
    }

    async removeMediaFromPlaylist(playlistId: string, mediaId: string): Promise<void> {
        await this.init();
        if (!this.db) return;

        try {
            await this.db.executeSql(
                `DELETE FROM playlist_items WHERE playlist_id = ? AND media_id = ?`,
                [playlistId, mediaId]
            );
            console.log(`🗑️ Removed media ${mediaId} from playlist ${playlistId}`);
        } catch (error) {
            console.error("❌ Error removing from playlist:", error);
            throw error;
        }
    }
}

export default new DatabaseService();