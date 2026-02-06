
import { query } from './db.js';
import bcrypt from 'bcryptjs';
import { MOCK_MEMBERS, MOCK_COMMUNITIES, MOCK_EVENTS, MOCK_ATTENDANCE, MOCK_CONTRIBUTIONS } from './seedData.js';

const createTables = async () => {
    try {
        console.log('Creating tables...');

        await query(`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        address VARCHAR(255),
        passportPhotoUrl TEXT,
        status VARCHAR(50),
        assignedCommunity VARCHAR(255),
        joinDate VARCHAR(50)
      );
    `);

        await query(`
      CREATE TABLE IF NOT EXISTS communities (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        hostName VARCHAR(255),
        location VARCHAR(255),
        meetingDay VARCHAR(50),
        maxCapacity INTEGER
      );
    `);

        await query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        date VARCHAR(50),
        type VARCHAR(50),
        responsibleCommunity VARCHAR(255),
        location VARCHAR(255),
        startDate VARCHAR(50),
        startTime VARCHAR(50),
        endDate VARCHAR(50),
        endTime VARCHAR(50)
      );
    `);

        await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        date VARCHAR(50),
        eventName VARCHAR(255),
        memberName VARCHAR(255),
        status VARCHAR(50)
      );
    `);

        await query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id VARCHAR(255) PRIMARY KEY,
        date VARCHAR(50),
        memberName VARCHAR(255),
        amount REAL,
        type VARCHAR(50)
      );
    `);

        await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        name VARCHAR(255)
      );
    `);

        console.log('Tables created successfully.');
    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
};

const seedData = async () => {
    try {
        console.log('Seeding data...');

        // Users
        const { rows: userRows } = await query('SELECT count(*) FROM users');
        if (parseInt(userRows[0].count) === 0) {
            const hashedPassword = await bcrypt.hash('Password@123', 10);
            await query(
                'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
                ['admin@ssda.org', hashedPassword, 'admin', 'Admin User']
            );
            console.log('Seeded admin user: admin@ssda.org / Password@123');
        }

        // Check if data exists
        const { rows } = await query('SELECT count(*) FROM members');
        if (parseInt(rows[0].count) > 0) {
            console.log('Data already exists, skipping seed.');
            return;
        }

        // Members
        for (const m of MOCK_MEMBERS) {
            await query(
                'INSERT INTO members (id, fullName, phone, email, address, passportPhotoUrl, status, assignedCommunity, joinDate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [m.id, m.fullName, m.phone, m.email, m.address, m.passportPhotoUrl, m.status, m.assignedCommunity, m.joinDate]
            );
        }

        // Communities
        for (const c of MOCK_COMMUNITIES) {
            await query(
                'INSERT INTO communities (id, name, hostName, location, meetingDay, maxCapacity) VALUES ($1, $2, $3, $4, $5, $6)',
                [c.id, c.name, c.hostName, c.location, c.meetingDay, c.maxCapacity]
            );
        }

        // Events
        for (const e of MOCK_EVENTS) {
            await query(
                'INSERT INTO events (id, name, date, type, responsibleCommunity) VALUES ($1, $2, $3, $4, $5)',
                [e.id, e.name, e.date, e.type, e.responsibleCommunity]
            );
        }

        // Attendance
        for (const a of MOCK_ATTENDANCE) {
            await query(
                'INSERT INTO attendance (date, eventName, memberName, status) VALUES ($1, $2, $3, $4)',
                [a.date, a.eventName, a.memberName, a.status]
            );
        }

        // Contributions
        for (const c of MOCK_CONTRIBUTIONS) {
            await query(
                'INSERT INTO contributions (id, date, memberName, amount, type) VALUES ($1, $2, $3, $4, $5)',
                [c.id, c.date, c.memberName, c.amount, c.type]
            );
        }



        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Error seeding data:', err);
    }
};

const migrate = async () => {
    try {
        await createTables();
        await seedData();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

migrate();
