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
    
    // Users table
    await db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_address TEXT NOT NULL UNIQUE
        );
    `);

    // Orders table
    await db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_address TEXT NOT NULL,
            asset_address TEXT NOT NULL,
            direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
            order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit')),
            quantity REAL NOT NULL,
            limit_price REAL NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('open', 'filled', 'canceled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
        );
    `);

    // Balances table
    await db.run(`
        CREATE TABLE IF NOT EXISTS balances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_address TEXT NOT NULL,
            asset_address TEXT NOT NULL,
            quantity REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(wallet_address, asset_address, created_at)
        );
    `);
}

export async function down(): Promise<void> {
    const db = MigrationDB.getInstance();
    
    await db.run('DROP TABLE IF EXISTS balances;');
    await db.run('DROP TABLE IF EXISTS orders;');
    await db.run('DROP TABLE IF EXISTS users;');
}
