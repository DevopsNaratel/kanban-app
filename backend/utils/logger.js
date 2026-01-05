const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: {},
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf((info) => {
                    const {
                        timestamp,
                        level,
                        message,
                        requestId,
                        method,
                        path,
                        attributes,
                        metrics,
                        error,
                        stack,
                        ...rest
                    } = info;

                    const logObject = {
                        timestamp,
                        level,
                        requestId,
                        method,
                        path,
                        message
                    };

                    // Nest contextual data in attributes
                    if (attributes) {
                        logObject.attributes = attributes;
                    }

                    // Allow top-level payload/queryParams/userAgent to be auto-nested if somehow passed not in attributes
                    // but ideally the caller should structure it. 
                    // To be safe and compliant, we check if there are leftover fields in `rest` that might belong to attributes
                    // If strict compliance is needed, we might assume `rest` are attributes.
                    if (Object.keys(rest).length > 0) {
                        logObject.attributes = { ...logObject.attributes, ...rest };
                    }

                    if (metrics) {
                        logObject.metrics = metrics;
                    }

                    if (level === 'error') {
                        if (error) {
                            logObject.error = error;
                        } else if (stack) {
                            logObject.error = {
                                details: message, // or stack
                                stackTrace: stack,
                                code: 'INTERNAL_ERROR'
                            };
                        }
                    }

                    // Remove empty keys if any (optional, but clean)

                    return JSON.stringify(logObject);
                })
            )
        })
    ]
});

module.exports = logger;
