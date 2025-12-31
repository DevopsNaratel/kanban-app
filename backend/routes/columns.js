const express = require('express');
const router = express.Router();
const columnsController = require('../controllers/columnsController');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all column routes
router.use(authenticate);

// Column routes
router.get('/:id', columnsController.getColumnById);
router.post('/', columnsController.createColumn);
router.patch('/:id', columnsController.updateColumn);
router.delete('/:id', columnsController.deleteColumn);

// Column-related routes
router.get('/:columnId/tasks', columnsController.getColumnTasks);

module.exports = router;
