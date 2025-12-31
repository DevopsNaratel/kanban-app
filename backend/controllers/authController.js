const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateId, validateRequiredFields, createError } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register new user
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        validateRequiredFields(req.body, ['email', 'password', 'name']);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw createError('Invalid email format', 400);
        }

        // Validate password strength
        if (password.length < 6) {
            throw createError('Password must be at least 6 characters', 400);
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            throw createError('Email already registered', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const userId = generateId();
        const result = await db.query(
            `INSERT INTO users (id, email, password_hash, name)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, name, avatar_url, created_at`,
            [userId, email.toLowerCase(), passwordHash, name]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        validateRequiredFields(req.body, ['email', 'password']);

        // Find user
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            throw createError('Invalid email or password', 401);
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw createError('Invalid email or password', 401);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await db.query(
            'SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw createError('User not found', 404);
        }

        const user = result.rows[0];

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatar_url,
            createdAt: user.created_at
        });
    } catch (error) {
        next(error);
    }
};

// Update user profile
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name, avatarUrl } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

        if (Object.keys(updates).length === 0) {
            throw createError('No fields to update', 400);
        }

        updates.updated_at = new Date();

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }

        values.push(userId);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, avatar_url, created_at`;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            throw createError('User not found', 404);
        }

        const user = result.rows[0];

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatar_url,
            createdAt: user.created_at
        });
    } catch (error) {
        next(error);
    }
};

// Change password
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        validateRequiredFields(req.body, ['currentPassword', 'newPassword']);

        // Validate new password strength
        if (newPassword.length < 6) {
            throw createError('New password must be at least 6 characters', 400);
        }

        // Get current user
        const userResult = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw createError('User not found', 404);
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(
            currentPassword,
            userResult.rows[0].password_hash
        );

        if (!isValidPassword) {
            throw createError('Current password is incorrect', 401);
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3',
            [newPasswordHash, new Date(), userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};
