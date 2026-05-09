const express = require('express');
const { getAdminDashboard, getMemberDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/admin', protect, adminOnly, getAdminDashboard);
router.get('/member', protect, getMemberDashboard);

module.exports = router;
