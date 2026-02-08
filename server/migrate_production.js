
import pg from 'pg';
import dotenv from 'dotenv';

// Load .env.local for production DATABASE_URL
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const migrate = async () => {
    try {
        console.log('Connecting to Neon production database...');

        // Add location column
        console.log('Adding location column to events table...');
        await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR(255)');
        console.log('✓ Location column added.');

        // Add date/time columns
        console.log('Adding date/time columns to events table...');
        await pool.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS startDate VARCHAR(50),
            ADD COLUMN IF NOT EXISTS startTime VARCHAR(50),
            ADD COLUMN IF NOT EXISTS endDate VARCHAR(50),
            ADD COLUMN IF NOT EXISTS endTime VARCHAR(50)
        `);
        console.log('✓ Date/time columns added.');

        console.log('\n✅ All migrations completed successfully on Neon database!');
        process.exit(0);
    } catch (err) {
        console.error('Error running migration:', err);
        process.exit(1);
    }
};

migrate();
