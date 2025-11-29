import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = "VibeBox.db";
const database_version = "2.0"; // Incrementar versión para migración
const database_displayname = "VibeBox Database";
const database_size = 200000;

class DatabaseService {
    constructor() {
        this.db = null;
        this.initPromise = null;
        this.currentVersion = 2; // Versión actual del esquema
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

                // Verificar versión y migrar si es necesario
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

    async checkAndMigrate() {
        try {
            // Verificar si existe la tabla de versión
            const [versionCheck] = await this.db.executeSql(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='db_version';
      `);

            let currentDbVersion = 1;

            if (versionCheck.rows.length === 0) {
                // Primera vez o versión antigua - crear tabla de versión
                await this.db.executeSql(`
          CREATE TABLE IF NOT EXISTS db_version (
            version INTEGER PRIMARY KEY
          );
        `);
                await this.db.executeSql(`INSERT INTO db_version (version) VALUES (1);`);
            } else {
                // Obtener versión actual
                const [versionResult] = await this.db.executeSql(`SELECT version FROM db_version;`);
                if (versionResult.rows.length > 0) {
                    currentDbVersion = versionResult.rows.item(0).version;
                }
            }

            console.log(`📊 Current DB version: ${currentDbVersion}, Target: ${this.currentVersion}`);

            // Ejecutar migraciones necesarias
            if (currentDbVersion < this.currentVersion) {
                await this.migrate(currentDbVersion, this.currentVersion);
            }

        } catch (error) {
            console.error("❌ Error checking/migrating database:", error);
            // Si hay error, intentar recrear desde cero
            await this.recreateDatabase();
        }
    }

    async migrate(fromVersion, toVersion) {
        console.log(`🔄 Migrating database from v${fromVersion} to v${toVersion}...`);

        try {
            if (fromVersion === 1 && toVersion >= 2) {
                await this.migrateV1ToV2();
            }

            // Actualizar versión
            await this.db.executeSql(`UPDATE db_version SET version = ?;`, [toVersion]);
            console.log(`✅ Migration completed to v${toVersion}`);

        } catch (error) {
            console.error("❌ Migration failed:", error);
            throw error;
        }
    }

    async migrateV1ToV2() {
        console.log("🔄 Migrating v1 -> v2: Adding updated_at column...");

        try {
            // Verificar si la columna updated_at ya existe
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
                // Agregar columna updated_at
                await this.db.executeSql(`
          ALTER TABLE media_files 
          ADD COLUMN updated_at INTEGER DEFAULT 0;
        `);

                // Actualizar valores existentes con created_at
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

    async recreateDatabase() {
        console.log("🔨 Recreating database from scratch...");

        try {
            // Eliminar todas las tablas
            await this.db.executeSql(`DROP TABLE IF EXISTS media_files;`);
            await this.db.executeSql(`DROP TABLE IF EXISTS folders;`);
            await this.db.executeSql(`DROP TABLE IF EXISTS cache_metadata;`);
            await this.db.executeSql(`DROP TABLE IF EXISTS db_version;`);

            // Crear tabla de versión
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
          created_at INTEGER DEFAULT 0,
          updated_at INTEGER DEFAULT 0
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

            // Solo crear índice updated_at si la columna existe
            try {
                await this.db.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_media_updated 
          ON media_files (updated_at);
        `);
            } catch (e) {
                console.log("ℹ️ Skipping updated_at index (column may not exist yet)");
            }

            // Tabla de carpetas personalizadas
            await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS folders (
          path TEXT PRIMARY KEY,
          is_custom INTEGER DEFAULT 0,
          created_at INTEGER DEFAULT 0
        );
      `);

            // Tabla de metadatos del caché
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
     * Resetea completamente la base de datos (útil para debug)
     */
    async resetDatabase() {
        try {
            console.log("🔨 Resetting database...");

            if (this.db) {
                await this.db.close();
                this.db = null;
                this.initPromise = null;
            }

            // Eliminar el archivo de la base de datos
            await SQLite.deleteDatabase({
                name: database_name,
                location: 'default',
            });

            console.log("✅ Database reset completed. Reinitializing...");

            // Reinicializar
            await this.init();

        } catch (error) {
            console.error("❌ Error resetting database:", error);
            throw error;
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