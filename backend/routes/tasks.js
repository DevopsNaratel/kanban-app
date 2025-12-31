const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all task routes
router.use(authenticate);

// Task routes
router.get('/', tasksController.getAllTasks);
router.get('/:id', tasksController.getTaskById);
router.post('/', tasksController.createTask);
router.patch('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);
router.patch('/:id/move', tasksController.moveTask);

module.exports = router;
