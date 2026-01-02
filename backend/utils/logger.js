const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: {
        service: process.env.SERVICE_NAME || 'kanban-backend',
        env: process.env.NODE_ENV || 'development',
        pod: process.env.POD_NAME || 'unknown-pod',
        namespace: process.env.POD_NAMESPACE || 'unknown-namespace'
    },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf((info) => {
                    const {
                        timestamp,
                        level,
                        message,
                        service,
                        env,
                        pod,
                        namespace,
                        requestId,
                        stack,
                        ...rest
                    } = info;

                    const logObject = {
                        timestamp,
                        level,
                        message,
                        service,
                        env,
                        requestId: requestId || undefined, // Only include if present
                        pod,
                        namespace
                    };

                    if (stack) {
                        logObject.stack = stack;
                    }

                    // Include any other metadata that was passed
                    Object.assign(logObject, rest);

                    return JSON.stringify(logObject);
                })
            )
        })
    ]
});

module.exports = logger;
