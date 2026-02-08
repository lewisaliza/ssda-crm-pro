
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-123';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Null token' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: err.message });
        req.user = user;
        next();
    });
};

// Auth Routes

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });

        // Don't modify the password on the original object in the DB, just remove it from response
        delete user.password;

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const { rows } = await query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Request Password Reset (Mock)
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    // In production, send email here.
    console.log(`Password reset requested for ${email}`);
    // Always return success to prevent user enumeration
    res.json({ message: 'If an account exists, a reset link has been sent.' });
});

// Reset Password (Mock - in reality would verify token)
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Middleware
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admin privileges required' });
    }
    next();
};

// User Management Routes (Admin Only)

// Get all users
app.get('/api/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { rows } = await query('SELECT id, email, name, role FROM users ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create User
app.post('/api/users', authenticateToken, authorizeAdmin, async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await query(
            'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
            [email, hashedPassword, name, role || 'user']
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User
app.put('/api/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { email, name, role, password } = req.body;
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const { rows } = await query(
                'UPDATE users SET email=$1, name=$2, role=$3, password=$4 WHERE id=$5 RETURNING id, email, name, role',
                [email, name, role, hashedPassword, id]
            );
            res.json(rows[0]);
        } else {
            const { rows } = await query(
                'UPDATE users SET email=$1, name=$2, role=$3 WHERE id=$4 RETURNING id, email, name, role',
                [email, name, role, id]
            );
            res.json(rows[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User
app.delete('/api/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    try {
        await query('DELETE FROM users WHERE id=$1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Members Routes
app.get('/api/members', authenticateToken, async (req, res) => {
    try {
        const { rows } = await query(`
      SELECT 
        id, 
        fullname as "fullName", 
        phone, 
        email, 
        address, 
        passportphotourl as "passportPhotoUrl", 
        status, 
        assignedcommunity as "assignedCommunity", 
        joindate as "joinDate" 
      FROM members
      ORDER BY length(id) DESC, id DESC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/members', authenticateToken, async (req, res) => {
    const { id, fullName, phone, email, address, passportPhotoUrl, status, assignedCommunity, joinDate } = req.body;
    try {
        const { rows } = await query(
            'INSERT INTO members (id, fullname, phone, email, address, passportphotourl, status, assignedcommunity, joindate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, fullname as "fullName", phone, email, address, passportphotourl as "passportPhotoUrl", status, assignedcommunity as "assignedCommunity", joindate as "joinDate"',
            [id, fullName, phone, email, address, passportPhotoUrl, status, assignedCommunity, joinDate]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { fullName, phone, email, address, passportPhotoUrl, status, assignedCommunity, joinDate } = req.body;
    try {
        const { rows } = await query(
            'UPDATE members SET fullname=$1, phone=$2, email=$3, address=$4, passportphotourl=$5, status=$6, assignedcommunity=$7, joindate=$8 WHERE id=$9 RETURNING id, fullname as "fullName", phone, email, address, passportphotourl as "passportPhotoUrl", status, assignedcommunity as "assignedCommunity", joindate as "joinDate"',
            [fullName, phone, email, address, passportPhotoUrl, status, assignedCommunity, joinDate, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM members WHERE id=$1', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Communities Routes
app.get('/api/communities', authenticateToken, async (req, res) => {
    try {
        const { rows } = await query(`
      SELECT 
        id, 
        name, 
        hostname as "hostName", 
        location, 
        meetingday as "meetingDay", 
        maxcapacity as "maxCapacity" 
      FROM communities
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/communities', authenticateToken, async (req, res) => {
    const { id, name, hostName, location, meetingDay, maxCapacity } = req.body;
    try {
        const { rows } = await query(
            'INSERT INTO communities (id, name, hostName, location, meetingDay, maxCapacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, hostname as "hostName", location, meetingday as "meetingDay", maxcapacity as "maxCapacity"',
            [id, name, hostName, location, meetingDay, maxCapacity]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/communities/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, hostName, location, meetingDay, maxCapacity } = req.body;
    try {
        const { rows } = await query(
            'UPDATE communities SET name=$1, hostName=$2, location=$3, meetingDay=$4, maxCapacity=$5 WHERE id=$6 RETURNING id, name, hostname as "hostName", location, meetingday as "meetingDay", maxcapacity as "maxCapacity"',
            [name, hostName, location, meetingDay, maxCapacity, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/communities/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM communities WHERE id=$1', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Events Routes
app.get('/api/events', authenticateToken, async (req, res) => {
    try {
        const { rows } = await query(`
      SELECT 
        id, 
        name, 
        date, 
        type, 
        responsiblecommunity as "responsibleCommunity",
        location,
        startdate as "startDate",
        starttime as "startTime",
        enddate as "endDate",
        endtime as "endTime"
      FROM events
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/events', authenticateToken, async (req, res) => {
    const { id, name, date, type, responsibleCommunity, location, startDate, startTime, endDate, endTime } = req.body;
    try {
        const { rows } = await query(
            'INSERT INTO events (id, name, date, type, responsibleCommunity, location, startDate, startTime, endDate, endTime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, name, date, type, responsiblecommunity as "responsibleCommunity", location, startdate as "startDate", starttime as "startTime", enddate as "endDate", endtime as "endTime"',
            [id, name, date, type, responsibleCommunity, location, startDate, startTime, endDate, endTime]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, date, type, responsibleCommunity, location, startDate, startTime, endDate, endTime } = req.body;
    try {
        const { rows } = await query(
            'UPDATE events SET name=$1, date=$2, type=$3, responsibleCommunity=$4, location=$5, startDate=$6, startTime=$7, endDate=$8, endTime=$9 WHERE id=$10 RETURNING id, name, date, type, responsiblecommunity as "responsibleCommunity", location, startdate as "startDate", starttime as "startTime", enddate as "endDate", endtime as "endTime"',
            [name, date, type, responsibleCommunity, location, startDate, startTime, endDate, endTime, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM events WHERE id=$1', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Attendance Routes
app.get('/api/attendance', authenticateToken, async (req, res) => {
    try {
        const { rows } = await query(`
      SELECT 
        date, 
        eventname as "eventName", 
        membername as "memberName", 
        status 
      FROM attendance
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance', authenticateToken, async (req, res) => {
    const { date, eventName, memberName, status } = req.body;
    try {
        const { rows } = await query(
            'INSERT INTO attendance (date, eventName, memberName, status) VALUES ($1, $2, $3, $4) RETURNING date, eventname as "eventName", membername as "memberName", status',
            [date, eventName, memberName, status]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Contributions Routes
app.get('/api/contributions', authenticateToken, async (req, res) => {
    try {
        const { rows } = await query(`
      SELECT 
        id, 
        date, 
        membername as "memberName", 
        amount, 
        type 
      FROM contributions
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contributions', authenticateToken, async (req, res) => {
    const { id, date, memberName, amount, type } = req.body;
    try {
        const { rows } = await query(
            'INSERT INTO contributions (id, date, memberName, amount, type) VALUES ($1, $2, $3, $4, $5) RETURNING id, date, membername as "memberName", amount, type',
            [id, date, memberName, amount, type]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default app;
