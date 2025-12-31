const express = require('express');
const router = express.Router();
const boardsController = require('../controllers/boardsController');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all board routes
router.use(authenticate);

// Board routes
router.get('/', boardsController.getAllBoards);
router.get('/:id', boardsController.getBoardById);
router.post('/', boardsController.createBoard);
router.patch('/:id', boardsController.updateBoard);
router.delete('/:id', boardsController.deleteBoard);
router.patch('/:id/star', boardsController.toggleBoardStar);
router.patch('/:id/view', boardsController.markBoardAsViewed);

// Board-related routes
router.get('/:boardId/columns', boardsController.getBoardColumns);
router.get('/:boardId/tasks', boardsController.getBoardTasks);
router.patch('/:boardId/columns/reorder', boardsController.reorderColumns);

module.exports = router;
