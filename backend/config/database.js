const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'postgres-service.database-test.svc.cluster.local',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kanban_db',
    user: process.env.DB_USER || 'adminuser',
    password: process.env.DB_PASSWORD || 'Rahasia123',
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
});

// Test connection
pool.on('connect', () => {
    logger.info('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    logger.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.info('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        logger.error('Query error:', error);
        throw error;
    }
};

// Helper function to get a client from the pool
const getClient = () => pool.connect();

module.exports = {
    query,
    getClient,
    pool,
};
