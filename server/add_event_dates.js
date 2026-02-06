
import { query } from './db.js';

const migrate = async () => {
    try {
        console.log('Adding date/time columns to events table...');
        await query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS startDate VARCHAR(50),
            ADD COLUMN IF NOT EXISTS startTime VARCHAR(50),
            ADD COLUMN IF NOT EXISTS endDate VARCHAR(50),
            ADD COLUMN IF NOT EXISTS endTime VARCHAR(50)
        `);
        console.log('Columns added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error adding columns:', err);
        process.exit(1);
    }
};

migrate();
