const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRouter = require('./routes/auth');
const boardsRouter = require('./routes/boards');
const columnsRouter = require('./routes/columns');
const tasksRouter = require('./routes/tasks');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);

    if (req.method === 'POST' && req.body) {
        const sanitizedBody = { ...req.body };
        const sensitiveFields = ['password', 'token', 'secret', 'authorization'];

        sensitiveFields.forEach(field => {
            if (sanitizedBody[field]) {
                sanitizedBody[field] = '***';
            }
        });

        logger.info('Request Payload:', sanitizedBody);
    }

    next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/columns', columnsRouter);
app.use('/api/tasks', tasksRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    logger.warn(`404 - Not Found - ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📡 API available at http://localhost:${PORT}/api`);
    logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
});

module.exports = app;
