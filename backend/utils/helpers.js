const crypto = require('crypto');

/**
 * Generate a unique ID
 * @returns {string} A unique identifier
 */
const generateId = () => {
    return crypto.randomBytes(8).toString('hex');
};

/**
 * Get current timestamp in milliseconds
 * @returns {number} Current timestamp
 */
const getCurrentTimestamp = () => {
    return Date.now();
};

/**
 * Validate required fields
 * @param {object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @throws {Error} If any required field is missing
 */
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null || data[field] === '');
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
};

/**
 * Validate priority value
 * @param {string} priority - Priority value to validate
 * @returns {boolean} True if valid
 */
const isValidPriority = (priority) => {
    return ['low', 'medium', 'high'].includes(priority);
};

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Error} Error object with status
 */
const createError = (message, status = 500) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

/**
 * Convert snake_case string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
const toCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Convert object keys from snake_case to camelCase
 * @param {object} obj - Object to convert
 * @returns {object} Object with camelCase keys
 */
const toCamelCaseKeys = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCaseKeys(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [toCamelCase(key)]: toCamelCaseKeys(obj[key]),
            }),
            {}
        );
    }
    return obj;
};

module.exports = {
    generateId,
    getCurrentTimestamp,
    validateRequiredFields,
    isValidPriority,
    createError,
    toCamelCaseKeys,
};