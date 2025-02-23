import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

export class SQLiteDB {
    private static instance: SQLiteDB;
    private db: Database;

    private constructor() {
        const dbPath = path.join(process.cwd(), 'data', 'app.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('Connected to SQLite database');
                this.initializeTables();
            }
        });
    }

    public static getInstance(): SQLiteDB {
        if (!SQLiteDB.instance) {
            SQLiteDB.instance = new SQLiteDB();
        }
        return SQLiteDB.instance;
    }

    private initializeTables(): void {
        // Add your table creation SQL here
        const createTablesSQL = `
            CREATE TABLE IF NOT EXISTS components (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                code TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;

        this.db.exec(createTablesSQL, (err) => {
            if (err) {
                console.error('Error creating tables:', err);
            } else {
                console.log('Database tables initialized');
            }
        });
    }

    public async get<T>(sql: string, params: any[] = []): Promise<T> {
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

    public async all<T>(sql: string, params: any[] = []): Promise<T[]> {
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

    public close(): void {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}
