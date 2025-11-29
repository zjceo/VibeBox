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
    private currentVersion = 3;

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

                await this.checkAndMigrate();
                await this.createTables();
                console.log("✅ Database initialized successfully");
                resolve();
            } catch (error) {
                console.error("❌ Database initialization failed:", error);
                reject(error);
            }
        });

        return this.initPromise;
    }

    private async checkAndMigrate(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        try {
            const [versionCheck] = await this.db.executeSql(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='db_version';
      `);

            let currentDbVersion = 1;

            if (versionCheck.rows.length === 0) {
                await this.db.executeSql(`
          CREATE TABLE IF NOT EXISTS db_version (
            version INTEGER PRIMARY KEY
          );
        `);
                await this.db.executeSql(`INSERT INTO db_version (version) VALUES (1);`);
            } else {
                const [versionResult] = await this.db.executeSql(`SELECT version FROM db_version;`);
                if (versionResult.rows.length > 0) {
                    currentDbVersion = versionResult.rows.item(0).version;
                }
            }

            console.log(`📊 Current DB version: ${currentDbVersion}, Target: ${this.currentVersion}`);

            if (currentDbVersion < this.currentVersion) {
                await this.migrate(currentDbVersion, this.currentVersion);
            }
        } catch (error) {
            console.error("❌ Error checking/migrating database:", error);
            await this.recreateDatabase();
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

    private async recreateDatabase(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log("🔨 Recreating database from scratch...");

        try {
            await this.db.executeSql(`DROP TABLE IF EXISTS media_files;`);
            await this.db.executeSql(`DROP TABLE IF EXISTS folders;`);
            await this.db.executeSql(`DROP TABLE IF EXISTS cache_metadata;`);
            await this.db.executeSql(`DROP TABLE IF EXISTS db_version;`);

            await this.db.executeSql(`
        CREATE TABLE db_version (
          version INTEGER PRIMARY KEY
        );
      `);
            await this.db.executeSql(`INSERT INTO db_version (version) VALUES (?);`, [this.currentVersion]);

            console.log("✅ Database recreated successfully");
        } catch (error) {
            console.error("❌ Error recreating database:", error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) return;

        try {
            await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS media_files (
          id TEXT PRIMARY KEY,
          path TEXT NOT NULL UNIQUE,
          name TEXT,
          title TEXT,
          size INTEGER,
          duration TEXT,
          type TEXT NOT NULL,
          extension TEXT,
          created_at INTEGER DEFAULT 0,
          updated_at INTEGER DEFAULT 0
        );
      `);

            await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_media_type 
        ON media_files (type);
      `);

            await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_media_name 
        ON media_files (name);
      `);

            try {
                await this.db.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_media_updated 
          ON media_files (updated_at);
        `);
            } catch (e) {
                console.log("ℹ️ Skipping updated_at index (column may not exist yet)");
            }

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

            console.log("✅ Tables created successfully");
        } catch (error) {
            console.error("❌ Error creating tables:", error);
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
}

export default new DatabaseService();