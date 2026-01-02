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
        pod: process.env.HOSTNAME || 'unknown-pod',

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
                        pod,
                        requestId,
                        stack,
                        ...rest
                    } = info;

                    const logObject = {
                        timestamp,
                        level,
                        message,
                        service,
                        requestId: requestId || undefined, // Only include if present
                        pod,
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
