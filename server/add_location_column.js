
import { query } from './db.js';

const migrate = async () => {
    try {
        console.log('Adding location column to events table...');
        await query('ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR(255)');
        console.log('Column added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error adding column:', err);
        process.exit(1);
    }
};

migrate();
