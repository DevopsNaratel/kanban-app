const db = require('../config/database');
const { generateId, getCurrentTimestamp, validateRequiredFields, createError, toCamelCaseKeys } = require('../utils/helpers');

// Helper to verify board ownership for a column
const verifyColumnOwnership = async (clientOrDb, columnId, userId) => {
    const query = `
        SELECT c.id 
        FROM columns c
        JOIN boards b ON c.board_id = b.id
        WHERE c.id = $1 AND b.user_id = $2
    `;
    const result = await clientOrDb.query(query, [columnId, userId]);
    if (result.rows.length === 0) {
        throw createError('Column not found or access denied', 404);
    }
};

// Helper to verify board ownership via boardId
const verifyBoardOwnership = async (clientOrDb, boardId, userId) => {
    const query = 'SELECT id FROM boards WHERE id = $1 AND user_id = $2';
    const result = await clientOrDb.query(query, [boardId, userId]);
    if (result.rows.length === 0) {
        throw createError('Board not found or access denied', 404);
    }
};

// Get single column by ID
const getColumnById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await verifyColumnOwnership(db, id, userId);

        const result = await db.query('SELECT * FROM columns WHERE id = $1', [id]);
        res.json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// Create new column
const createColumn = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { boardId, title, order } = req.body;
        const userId = req.user.userId;

        validateRequiredFields(req.body, ['boardId', 'title', 'order']);

        // Verify board ownership
        await verifyBoardOwnership(client, boardId, userId);

        const columnId = generateId();

        // Create column
        const result = await client.query(
            `INSERT INTO columns (id, board_id, title, "order")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [columnId, boardId, title, order]
        );

        // Update board's last_updated
        await client.query(
            'UPDATE boards SET last_updated = $1 WHERE id = $2',
            [getCurrentTimestamp(), boardId]
        );

        await client.query('COMMIT');
        res.status(201).json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// Update column
const updateColumn = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        // Verify ownership
        await verifyColumnOwnership(client, id, userId);

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id' && key !== 'boardId') {
                const columnName = key === 'order' ? '"order"' : key;
                fields.push(`${columnName} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (fields.length === 0) {
            throw createError('No fields to update', 400);
        }

        values.push(id);
        const query = `UPDATE columns SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const result = await client.query(query, values);

        // Update board's last_updated
        const boardId = result.rows[0].board_id;
        await client.query(
            'UPDATE boards SET last_updated = $1 WHERE id = $2',
            [getCurrentTimestamp(), boardId]
        );

        await client.query('COMMIT');
        res.json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// Delete column
const deleteColumn = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const userId = req.user.userId;

        // Get board_id and verify ownership
        const columnResult = await client.query(
            `SELECT c.board_id 
             FROM columns c
             JOIN boards b ON c.board_id = b.id
             WHERE c.id = $1 AND b.user_id = $2`,
            [id, userId]
        );

        if (columnResult.rows.length === 0) {
            throw createError('Column not found or access denied', 404);
        }

        const boardId = columnResult.rows[0].board_id;

        // Delete column (tasks will be cascade deleted)
        await client.query('DELETE FROM columns WHERE id = $1', [id]);

        // Update board's last_updated
        await client.query(
            'UPDATE boards SET last_updated = $1 WHERE id = $2',
            [getCurrentTimestamp(), boardId]
        );

        await client.query('COMMIT');
        res.status(204).send();
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// Get column tasks
const getColumnTasks = async (req, res, next) => {
    try {
        const { columnId } = req.params;
        const userId = req.user.userId;

        await verifyColumnOwnership(db, columnId, userId);

        const result = await db.query(
            'SELECT * FROM tasks WHERE column_id = $1 ORDER BY created_at',
            [columnId]
        );
        res.json(toCamelCaseKeys(result.rows));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getColumnById,
    createColumn,
    updateColumn,
    deleteColumn,
    getColumnTasks,
};