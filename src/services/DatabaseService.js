import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = "VibeBox.db";
const database_version = "1.0";
const database_displayname = "VibeBox Database";
const database_size = 200000;

class DatabaseService {
    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                this.db = await SQLite.openDatabase(
                    database_name,
                    database_version,
                    database_displayname,
                    database_size
                );

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

    async createTables() {
        if (!this.db) return;

        try {
            // Tabla de archivos multimedia con índices optimizados
            await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS media_files (
          id TEXT PRIMARY KEY,
          path TEXT NOT NULL UNIQUE,
          name TEXT,
          size INTEGER,
          duration TEXT,
          type TEXT NOT NULL,
          extension TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );
      `);

            // Índices para búsqueda rápida
            await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_media_type 
        ON media_files (type);
      `);

            await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_media_name 
        ON media_files (name);
      `);

            await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_media_updated 
        ON media_files (updated_at);
      `);

            // Tabla de carpetas personalizadas
            await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS folders (
          path TEXT PRIMARY KEY,
          is_custom INTEGER DEFAULT 0,
          created_at INTEGER
        );
      `);

            // Tabla de metadatos del caché
            await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS cache_metadata (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at INTEGER
        );
      `);

            console.log("✅ Tables created successfully");
        } catch (error) {
            console.error("❌ Error creating tables:", error);
            throw error;
        }
    }

    /**
     * Obtiene todos los archivos multimedia (optimizado)
     */
    async getMediaFiles() {
        await this.init();
        try {
            const [results] = await this.db.executeSql(
                `SELECT * FROM media_files ORDER BY name ASC`
            );

            const files = [];
            for (let i = 0; i < results.rows.length; i++) {
                files.push(results.rows.item(i));
            }

            console.log(`📁 Loaded ${files.length} files from database`);
            return files;
        } catch (error) {
            console.error("❌ Error getting media files:", error);
            return [];
        }
    }

    /**
     * Obtiene archivos por tipo (más rápido que filtrar después)
     */
    async getMediaFilesByType(type) {
        await this.init();
        try {
            const [results] = await this.db.executeSql(
                `SELECT * FROM media_files WHERE type = ? ORDER BY name ASC`,
                [type]
            );

            const files = [];
            for (let i = 0; i < results.rows.length; i++) {
                files.push(results.rows.item(i));
            }

            return files;
        } catch (error) {
            console.error(`❌ Error getting ${type} files:`, error);
            return [];
        }
    }

    /**
     * Guarda archivos de forma optimizada con transacción por lotes
     */
    async saveMediaFiles(files) {
        await this.init();
        if (!files || files.length === 0) return;

        const BATCH_SIZE = 100; // Procesar en lotes de 100
        const totalBatches = Math.ceil(files.length / BATCH_SIZE);

        try {
            console.log(`💾 Saving ${files.length} files in ${totalBatches} batches...`);
            const startTime = Date.now();

            // Limpiar tabla existente de forma eficiente
            await this.db.executeSql('DELETE FROM media_files');

            // Procesar en lotes
            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const start = batchIndex * BATCH_SIZE;
                const end = Math.min(start + BATCH_SIZE, files.length);
                const batch = files.slice(start, end);

                await this.db.transaction(async (tx) => {
                    // Preparar todos los inserts del lote
                    const promises = batch.map(file =>
                        tx.executeSql(
                            `INSERT OR REPLACE INTO media_files 
              (id, path, name, size, duration, type, extension, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                file.id,
                                file.path,
                                file.name,
                                file.size || 0,
                                file.duration || '',
                                file.type,
                                file.extension,
                                file.created_at || Date.now(),
                                Date.now()
                            ]
                        )
                    );

                    await Promise.all(promises);
                });

                // Log de progreso
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

    /**
     * Actualiza un archivo específico (para cambios incrementales)
     */
    async updateMediaFile(file) {
        await this.init();
        try {
            await this.db.executeSql(
                `INSERT OR REPLACE INTO media_files 
        (id, path, name, size, duration, type, extension, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    file.id,
                    file.path,
                    file.name,
                    file.size || 0,
                    file.duration || '',
                    file.type,
                    file.extension,
                    file.created_at || Date.now(),
                    Date.now()
                ]
            );
        } catch (error) {
            console.error("❌ Error updating media file:", error);
        }
    }

    /**
     * Elimina un archivo específico
     */
    async deleteMediaFile(id) {
        await this.init();
        try {
            await this.db.executeSql(
                `DELETE FROM media_files WHERE id = ?`,
                [id]
            );
        } catch (error) {
            console.error("❌ Error deleting media file:", error);
        }
    }

    /**
     * Cuenta archivos por tipo
     */
    async countMediaFilesByType(type) {
        await this.init();
        try {
            const [results] = await this.db.executeSql(
                `SELECT COUNT(*) as count FROM media_files WHERE type = ?`,
                [type]
            );
            return results.rows.item(0).count;
        } catch (error) {
            console.error("❌ Error counting files:", error);
            return 0;
        }
    }

    /**
     * Obtiene carpetas
     */
    async getFolders() {
        await this.init();
        try {
            const [results] = await this.db.executeSql(`SELECT * FROM folders`);
            const folders = [];
            for (let i = 0; i < results.rows.length; i++) {
                folders.push(results.rows.item(i));
            }
            return folders;
        } catch (error) {
            console.error("❌ Error getting folders:", error);
            return [];
        }
    }

    /**
     * Guarda una carpeta
     */
    async saveFolder(path, isCustom = false) {
        await this.init();
        try {
            await this.db.executeSql(
                `INSERT OR REPLACE INTO folders (path, is_custom, created_at) 
        VALUES (?, ?, ?)`,
                [path, isCustom ? 1 : 0, Date.now()]
            );
        } catch (error) {
            console.error("❌ Error saving folder:", error);
        }
    }

    /**
     * Elimina una carpeta
     */
    async removeFolder(path) {
        await this.init();
        try {
            await this.db.executeSql(`DELETE FROM folders WHERE path = ?`, [path]);
        } catch (error) {
            console.error("❌ Error removing folder:", error);
        }
    }

    /**
     * Guarda metadato del caché
     */
    async setCacheMetadata(key, value) {
        await this.init();
        try {
            await this.db.executeSql(
                `INSERT OR REPLACE INTO cache_metadata (key, value, updated_at) 
        VALUES (?, ?, ?)`,
                [key, JSON.stringify(value), Date.now()]
            );
        } catch (error) {
            console.error("❌ Error setting cache metadata:", error);
        }
    }

    /**
     * Obtiene metadato del caché
     */
    async getCacheMetadata(key) {
        await this.init();
        try {
            const [results] = await this.db.executeSql(
                `SELECT value FROM cache_metadata WHERE key = ?`,
                [key]
            );

            if (results.rows.length > 0) {
                return JSON.parse(results.rows.item(0).value);
            }
            return null;
        } catch (error) {
            console.error("❌ Error getting cache metadata:", error);
            return null;
        }
    }

    /**
     * Limpia la caché de forma eficiente
     */
    async clearCache() {
        await this.init();
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

    /**
     * Obtiene estadísticas de la base de datos
     */
    async getDatabaseStats() {
        await this.init();
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
                total: totalResult.rows.item(0).total,
                audio: audioResult.rows.item(0).count,
                video: videoResult.rows.item(0).count,
            };
        } catch (error) {
            console.error("❌ Error getting database stats:", error);
            return { total: 0, audio: 0, video: 0 };
        }
    }

    /**
     * Busca archivos por nombre
     */
    async searchFiles(query) {
        await this.init();
        try {
            const [results] = await this.db.executeSql(
                `SELECT * FROM media_files 
        WHERE name LIKE ? 
        ORDER BY name ASC 
        LIMIT 50`,
                [`%${query}%`]
            );

            const files = [];
            for (let i = 0; i < results.rows.length; i++) {
                files.push(results.rows.item(i));
            }
            return files;
        } catch (error) {
            console.error("❌ Error searching files:", error);
            return [];
        }
    }

    /**
     * Optimiza la base de datos (ejecutar periódicamente)
     */
    async optimizeDatabase() {
        await this.init();
        try {
            console.log("🔧 Optimizing database...");
            await this.db.executeSql('VACUUM');
            await this.db.executeSql('ANALYZE');
            console.log("✅ Database optimized");
        } catch (error) {
            console.error("❌ Error optimizing database:", error);
        }
    }
}

export default new DatabaseService();