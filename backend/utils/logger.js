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
                        payload,
                        queryParams,
                        userAgent,
                        stack,
                        error, // in case it's passed explicitly
                        ...rest
                    } = info;

                    const logObject = {
                        timestamp,
                        level,
                        requestId,
                        method,
                        path,
                        message,
                    };

                    // Optional fields based on standard
                    if (payload) logObject.payload = payload;
                    if (queryParams && Object.keys(queryParams).length > 0) logObject.queryParams = queryParams;
                    if (userAgent) logObject.userAgent = userAgent;

                    // Error handling
                    if (level === 'error') {
                        // If 'error' object is passed directly or if 'stack' exists (from logger.error(err))
                        if (error) {
                            logObject.error = error;
                        } else if (stack) {
                            logObject.error = {
                                details: stack,
                                // You might want to extract code if available, otherwise generic
                                code: rest.code || 'INTERNAL_ERROR'
                            };
                        }
                    }

                    // Include any other metadata that was passed, but be careful not to pollute if strict
                    // The standard seems strict, so maybe we only include specific ones or 'rest' if truly needed.
                    // For now, let's include rest to capture unexpected context, but normally we'd filter.
                    // But since we removed service/pod from defaultMeta, they won't be here unless passed.

                    return JSON.stringify(logObject);
                })
            )
        })
    ]
});

module.exports = logger;
