const db = require('../config/database');
const { generateId, getCurrentTimestamp, validateRequiredFields, isValidPriority, createError, toCamelCaseKeys } = require('../utils/helpers');

// Helper to verify task ownership
const verifyTaskOwnership = async (clientOrDb, taskId, userId) => {
    const query = `
        SELECT t.id, t.column_id
        FROM tasks t
        JOIN columns c ON t.column_id = c.id
        JOIN boards b ON c.board_id = b.id
        WHERE t.id = $1 AND b.user_id = $2
    `;
    const result = await clientOrDb.query(query, [taskId, userId]);
    if (result.rows.length === 0) {
        throw createError('Task not found or access denied', 404);
    }
    return result.rows[0];
};

// Helper to verify column ownership (for creating/moving tasks)
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

// Get all tasks (for user)
const getAllTasks = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await db.query(
            `SELECT t.* 
             FROM tasks t
             JOIN columns c ON t.column_id = c.id
             JOIN boards b ON c.board_id = b.id
             WHERE b.user_id = $1
             ORDER BY t.created_at DESC`,
            [userId]
        );
        res.json(toCamelCaseKeys(result.rows));
    } catch (error) {
        next(error);
    }
};

// Get single task by ID
const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await verifyTaskOwnership(db, id, userId);

        const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
        res.json(toCamelCaseKeys(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// Create new task
const createTask = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { columnId, title, description, priority, dueDate } = req.body;
        const userId = req.user.userId;

        validateRequiredFields(req.body, ['columnId', 'title', 'priority']);

        if (!isValidPriority(priority)) {
            throw createError('Invalid priority. Must be low, medium, or high', 400);
        }

        // Verify column ownership
        await verifyColumnOwnership(client, columnId, userId);

        const taskId = generateId();

        // Create task
        const result = await client.query(
            `INSERT INTO tasks (id, column_id, title, description, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [taskId, columnId, title, description || null, priority, dueDate || null]
        );

        // Update board's last_updated
        await client.query(
            `UPDATE boards SET last_updated = $1
       WHERE id = (SELECT board_id FROM columns WHERE id = $2)`,
            [getCurrentTimestamp(), columnId]
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

// Update task
const updateTask = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        // Verify ownership
        await verifyTaskOwnership(client, id, userId);

        // Validate priority if it's being updated
        if (updates.priority && !isValidPriority(updates.priority)) {
            throw createError('Invalid priority. Must be low, medium, or high', 400);
        }

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id') {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (fields.length === 0) {
            throw createError('No fields to update', 400);
        }

        values.push(id);
        const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const result = await client.query(query, values);

        // Update board's last_updated
        const columnId = result.rows[0].column_id;
        await client.query(
            `UPDATE boards SET last_updated = $1
       WHERE id = (SELECT board_id FROM columns WHERE id = $2)`,
            [getCurrentTimestamp(), columnId]
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

// Delete task
const deleteTask = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const userId = req.user.userId;

        // Verify ownership and get column_id
        const task = await verifyTaskOwnership(client, id, userId);
        const columnId = task.column_id;

        // Delete task
        await client.query('DELETE FROM tasks WHERE id = $1', [id]);

        // Update board's last_updated
        await client.query(
            `UPDATE boards SET last_updated = $1
       WHERE id = (SELECT board_id FROM columns WHERE id = $2)`,
            [getCurrentTimestamp(), columnId]
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

// Move task to different column
const moveTask = async (req, res, next) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { columnId } = req.body;
        const userId = req.user.userId;

        if (!columnId) {
            throw createError('columnId is required', 400);
        }

        // Verify ownership of the task
        await verifyTaskOwnership(client, id, userId);

        // Verify ownership of the target column
        await verifyColumnOwnership(client, columnId, userId);

        // Update task's column
        const result = await client.query(
            'UPDATE tasks SET column_id = $1 WHERE id = $2 RETURNING *',
            [columnId, id]
        );

        // Update board's last_updated
        await client.query(
            `UPDATE boards SET last_updated = $1
       WHERE id = (SELECT board_id FROM columns WHERE id = $2)`,
            [getCurrentTimestamp(), columnId]
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

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
};