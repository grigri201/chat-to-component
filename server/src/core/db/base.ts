import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

export type DatabaseConfig = {
    filename?: string;
    memory?: boolean;
};

export abstract class BaseDB {
    private static db: Database;
    protected get db(): Database {
        return BaseDB.db;
    }

    protected constructor(config?: DatabaseConfig) {
        if (!BaseDB.db) {
            const dbPath = config?.memory ? ':memory:' : 
                config?.filename || path.join(process.cwd(), 'data', 'app.db');

            // Create data directory if it doesn't exist and we're not using memory mode
            if (!config?.memory && !config?.filename) {
                const dataDir = path.join(process.cwd(), 'data');
                if (!require('fs').existsSync(dataDir)) {
                    require('fs').mkdirSync(dataDir, { recursive: true });
                }
            }

            // Initialize database
            BaseDB.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    throw err;
                }
                console.log(`Connected to SQLite database: ${dbPath}`);
            });

            // Set database to serialize mode to ensure sequential execution
            BaseDB.db.serialize();
        }
    }

    protected async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as T);
                }
            });
        });
    }

    protected async all<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as T[]);
                }
            });
        });
    }

    public async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }
}
