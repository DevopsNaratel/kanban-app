const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
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

// Request ID Middleware
app.use((req, res, next) => {
    req.id = uuidv4();
    next();
});

// Performance Logging Middleware
app.use((req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1000) + (diff[1] / 1e6);
        const thresholdMs = 1000; // 1 second threshold

        if (durationMs > thresholdMs) {
            logger.warn('Slow request detected', {
                requestId: req.id,
                method: 'INTERNAL', // or req.method, but LOGGER.md example used INTERNAL for perf events, though for HTTP maybe keep Method? The example was 'Database/QueryExecutor'. For HTTP slow request, maybe use req.method. Let's stick to the spirit: it's a perf event.
                // The example says: method: "INTERNAL", path: "Database/QueryExecutor".
                // uniquely identifying this as a slow HTTP request:
                path: req.path, // Keep path
                metrics: {
                    executionTimeMs: durationMs,
                    thresholdMs: thresholdMs
                }
            });
        }
    });

    next();
});

// Request logging
app.use((req, res, next) => {
    const logMeta = {
        requestId: req.id,
        method: req.method,
        path: req.path,
    };

    // Construct attributes object
    const attributes = {
        userAgent: req.headers['user-agent']
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const sanitizedBody = { ...req.body };
        const sensitiveFields = ['password', 'token', 'secret', 'authorization'];

        sensitiveFields.forEach(field => {
            if (sanitizedBody[field]) {
                sanitizedBody[field] = '***';
            }
        });

        attributes.payload = sanitizedBody;
    } else if (req.method === 'GET') {
        if (Object.keys(req.query).length > 0) {
            attributes.queryParams = req.query;
        }
    }

    logMeta.attributes = attributes;

    logger.info('Incoming request', logMeta);

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
    logger.error(err.message || 'Internal server error', {
        requestId: req.id,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            details: err.message,
            stackTrace: err.stack
        }
    });
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
