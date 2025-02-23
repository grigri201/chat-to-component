import { BaseDB } from '../base';

export class TestDB extends BaseDB {
    private static instance: TestDB;

    protected constructor() {
        super({ memory: true });
    }

    public static getInstance(): TestDB {
        if (!TestDB.instance) {
            TestDB.instance = new TestDB();
        }
        return TestDB.instance;
    }

    public async setupTestTables(): Promise<void> {
        // Enable foreign keys
        await this.run('PRAGMA foreign_keys = ON;');

        try {
            await this.run('BEGIN EXCLUSIVE TRANSACTION;');
            
            // Drop existing tables if they exist
            await this.run('DROP TABLE IF EXISTS balances;');
            await this.run('DROP TABLE IF EXISTS orders;');
            await this.run('DROP TABLE IF EXISTS users;');

            // Create tables
            await this.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    wallet_address TEXT NOT NULL UNIQUE
                );
            `);

            await this.run(`
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

            await this.run(`
                CREATE TABLE IF NOT EXISTS balances (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    wallet_address TEXT NOT NULL,
                    asset_address TEXT NOT NULL,
                    quantity REAL NOT NULL,
                    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address),
                    UNIQUE(wallet_address, asset_address)
                );
            `);
            await this.run('COMMIT;');
        } catch (err) {
            await this.run('ROLLBACK;');
            throw err;
        }
    }

    public async clearTables(): Promise<void> {
        try {
            await this.run('BEGIN EXCLUSIVE TRANSACTION;');
            await this.run('DELETE FROM balances;');
            await this.run('DELETE FROM orders;');
            await this.run('DELETE FROM users;');
            await this.run('COMMIT;');
        } catch (err) {
            await this.run('ROLLBACK;');
            throw err;
        }
    }

    public async dropTables(): Promise<void> {
        try {
            await this.run('BEGIN EXCLUSIVE TRANSACTION;');
            await this.run('DROP TABLE IF EXISTS balances;');
            await this.run('DROP TABLE IF EXISTS orders;');
            await this.run('DROP TABLE IF EXISTS users;');
            await this.run('COMMIT;');
        } catch (err) {
            await this.run('ROLLBACK;');
            throw err;
        }
    }
}
