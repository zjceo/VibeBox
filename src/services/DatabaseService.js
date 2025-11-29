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
                console.log("Database initialized successfully");
                resolve();
            } catch (error) {
                console.error("Database initialization failed:", error);
                reject(error);
            }
        });

        return this.initPromise;
    }

    async createTables() {
        if (!this.db) return;

        try {
            // Tabla de archivos multimedia
            await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS media_files (
          id TEXT PRIMARY KEY,
          path TEXT,
          name TEXT,
          size INTEGER,
          duration TEXT,
          type TEXT,
          extension TEXT,
          created_at INTEGER
        );
      `);

            // Índices para búsqueda rápida
            await this.db.executeSql(`CREATE INDEX IF NOT EXISTS idx_media_type ON media_files (type);`);

            // Tabla de carpetas personalizadas
            await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS folders (
          path TEXT PRIMARY KEY,
          is_custom INTEGER DEFAULT 0
        );
      `);

            console.log("Tables created successfully");
        } catch (error) {
            console.error("Error creating tables:", error);
            throw error;
        }
    }

    async getMediaFiles() {
        await this.init();
        try {
            const [results] = await this.db.executeSql(`SELECT * FROM media_files ORDER BY name ASC`);
            const files = [];
            for (let i = 0; i < results.rows.length; i++) {
                files.push(results.rows.item(i));
            }
            return files;
        } catch (error) {
            console.error("Error getting media files:", error);
            return [];
        }
    }

    async saveMediaFiles(files) {
        await this.init();
        if (!files || files.length === 0) return;

        try {
            await this.db.transaction(async (tx) => {
                // Limpiamos la tabla primero para una sincronización completa
                // Opcional: Podríamos hacer un diff más inteligente, pero por ahora reemplazamos para asegurar consistencia
                await tx.executeSql('DELETE FROM media_files');

                for (const file of files) {
                    await tx.executeSql(
                        `INSERT INTO media_files (id, path, name, size, duration, type, extension, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            file.id,
                            file.path,
                            file.name,
                            file.size,
                            file.duration || '',
                            file.type,
                            file.extension,
                            Date.now()
                        ]
                    );
                }
            });
            console.log(`Saved ${files.length} media files to database`);
        } catch (error) {
            console.error("Error saving media files:", error);
        }
    }

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
            console.error("Error getting folders:", error);
            return [];
        }
    }

    async saveFolder(path, isCustom = false) {
        await this.init();
        try {
            await this.db.executeSql(
                `INSERT OR REPLACE INTO folders (path, is_custom) VALUES (?, ?)`,
                [path, isCustom ? 1 : 0]
            );
        } catch (error) {
            console.error("Error saving folder:", error);
        }
    }

    async removeFolder(path) {
        await this.init();
        try {
            await this.db.executeSql(`DELETE FROM folders WHERE path = ?`, [path]);
        } catch (error) {
            console.error("Error removing folder:", error);
        }
    }

    async clearCache() {
        await this.init();
        try {
            await this.db.executeSql('DELETE FROM media_files');
            console.log("Cache cleared");
        } catch (error) {
            console.error("Error clearing cache:", error);
        }
    }
}

export default new DatabaseService();
