import { BaseDB } from '../base';

class MigrationDB extends BaseDB {
    private static instance: MigrationDB;

    private constructor() {
        super({ filename: 'data/app.db' });
    }

    public static getInstance(): MigrationDB {
        if (!MigrationDB.instance) {
            MigrationDB.instance = new MigrationDB();
        }
        return MigrationDB.instance;
    }
}

export async function up(): Promise<void> {
    const db = MigrationDB.getInstance();
    
    // Prices table
    await db.run(`
        CREATE TABLE IF NOT EXISTS prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_address TEXT NOT NULL,
            price TEXT NOT NULL,
            time TEXT NOT NULL,
            UNIQUE(asset_address, time)
        );
    `);
}

export async function down(): Promise<void> {
    const db = MigrationDB.getInstance();
    await db.run('DROP TABLE IF EXISTS prices;');
}
