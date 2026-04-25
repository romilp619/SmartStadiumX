const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, deactivateAlert, markRead, getActiveAlerts } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/active', protect, getActiveAlerts);
router.get('/', protect, getAlerts);
router.post('/', protect, authorize('admin'), createAlert);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateAlert);
router.put('/:id/read', protect, markRead);

module.exports = router;
