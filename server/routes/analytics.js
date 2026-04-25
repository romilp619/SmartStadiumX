const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueReport, getUserStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/revenue', protect, authorize('admin'), getRevenueReport);
router.get('/users', protect, authorize('admin'), getUserStats);

module.exports = router;
