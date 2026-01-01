const db = require('../config/database');
const { generateId, getCurrentTimestamp, validateRequiredFields, createError, toCamelCaseKeys, toSnakeCase } = require('../utils/helpers');

// Get all boards for the authenticated user
const getAllBoards = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await db.query(
            'SELECT * FROM boards WHERE user_id = $1 ORDER BY last_updated DESC',
            [userId]
        );
        res.json(toCamelCaseKeys(result.rows));
    } catch (error) {
        next(error);
    }
};

// Get single board by ID (only if it belongs to the user)
const getBoardById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await db.query(
            'SELECT * FROM boards WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        res.json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// Create new board
const createBoard = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { title, description, color } = req.body;
        const userId = req.user.userId;

        validateRequiredFields(req.body, ['title', 'color']);

        const boardId = generateId();
        const timestamp = getCurrentTimestamp();

        // Create board with user_id
        const boardResult = await client.query(
            `INSERT INTO boards (id, user_id, title, description, color, last_updated, is_starred)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [boardId, userId, title, description || '', color, timestamp, false]
        );

        // Create default columns
        const defaultColumns = [
            { title: 'To Do', order: 0 },
            { title: 'In Progress', order: 1 },
            { title: 'Done', order: 2 }
        ];

        for (const col of defaultColumns) {
            await client.query(
                `INSERT INTO columns (id, board_id, title, "order")
         VALUES ($1, $2, $3, $4)`,
                [generateId(), boardId, col.title, col.order]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(toCamelCaseKeys(boardResult.rows[0]));
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// Update board
const updateBoard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 1;

        // Always update last_updated
        updates.lastUpdated = getCurrentTimestamp();

        for (const [key, value] of Object.entries(updates)) {
            const snakeKey = toSnakeCase(key);
            if (snakeKey !== 'id' && snakeKey !== 'user_id') { // Prevent updating user_id or id
                fields.push(`${snakeKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (fields.length === 0) {
            throw createError('No fields to update', 400);
        }

        values.push(id);
        values.push(userId);

        const query = `UPDATE boards SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        res.json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// Delete board
const deleteBoard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await db.query(
            'DELETE FROM boards WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Toggle board star
const toggleBoardStar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await db.query(
            `UPDATE boards 
       SET is_starred = NOT is_starred, last_updated = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
            [getCurrentTimestamp(), id, userId]
        );

        if (result.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        res.json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// Mark board as viewed
const markBoardAsViewed = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const timestamp = getCurrentTimestamp();

        const result = await db.query(
            `UPDATE boards 
       SET last_viewed = $1, last_updated = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
            [timestamp, timestamp, id, userId]
        );

        if (result.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        res.json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// Get board columns
const getBoardColumns = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.user.userId;

        // Verify board belongs to user
        const boardCheck = await db.query(
            'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
            [boardId, userId]
        );

        if (boardCheck.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        const result = await db.query(
            'SELECT * FROM columns WHERE board_id = $1 ORDER BY "order"',
            [boardId]
        );
        res.json(toCamelCaseKeys(result.rows));
    } catch (error) {
        next(error);
    }
};

// Get board tasks
const getBoardTasks = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.user.userId;

        // Verify board belongs to user
        const boardCheck = await db.query(
            'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
            [boardId, userId]
        );

        if (boardCheck.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        const result = await db.query(
            `SELECT t.* FROM tasks t
       INNER JOIN columns c ON t.column_id = c.id
       WHERE c.board_id = $1`,
            [boardId]
        );
        res.json(toCamelCaseKeys(result.rows));
    } catch (error) {
        next(error);
    }
};

// Reorder columns
const reorderColumns = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { boardId } = req.params;
        const userId = req.user.userId;
        const { columnOrders } = req.body;

        if (!Array.isArray(columnOrders)) {
            throw createError('columnOrders must be an array', 400);
        }

        // Verify board belongs to user
        const boardCheck = await client.query(
            'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
            [boardId, userId]
        );

        if (boardCheck.rows.length === 0) {
            throw createError('Board not found', 404);
        }

        // Update each column's order
        for (const { id, order } of columnOrders) {
            await client.query(
                'UPDATE columns SET "order" = $1 WHERE id = $2 AND board_id = $3',
                [order, id, boardId]
            );
        }

        // Update board's last_updated
        await client.query(
            'UPDATE boards SET last_updated = $1 WHERE id = $2',
            [getCurrentTimestamp(), boardId]
        );

        // Get updated columns
        const result = await client.query(
            'SELECT * FROM columns WHERE board_id = $1 ORDER BY "order"',
            [boardId]
        );

        await client.query('COMMIT');
        res.json(toCamelCaseKeys(result.rows));
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    getAllBoards,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    toggleBoardStar,
    markBoardAsViewed,
    getBoardColumns,
    getBoardTasks,
    reorderColumns,
};