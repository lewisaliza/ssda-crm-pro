
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const dbConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'ssdadb',
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
    };

const pool = new Pool(dbConfig);

export const query = (text, params) => pool.query(text, params);
