const express = require('express');
const {
  createTask,
  getAllTasks,
  getTasksByProject,
  getOverdueTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, adminOnly, createTask);
router.get('/', protect, getAllTasks);
router.get('/overdue', protect, getOverdueTasks);
router.get('/project/:projectId', protect, getTasksByProject);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
