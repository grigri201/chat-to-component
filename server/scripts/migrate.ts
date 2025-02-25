import { up as up001 } from '../src/core/db/migrations/001_initial_schema';
import { up as up002 } from '../src/core/db/migrations/002_add_prices_table';

async function migrate() {
    try {
        console.log('Running migrations...');
        
        console.log('Running 001_initial_schema...');
        await up001();
        
        console.log('Running 002_add_prices_table...');
        await up002();
        
        console.log('All migrations completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
