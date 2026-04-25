const express = require('express');
const router = express.Router();
const { getZones, getZone, updateCongestion, createZone, getZoneStats } = require('../controllers/zoneController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, getZoneStats);
router.get('/', protect, getZones);
router.get('/:id', protect, getZone);
router.post('/', protect, authorize('admin'), createZone);
router.put('/:id/congestion', protect, authorize('admin', 'staff'), updateCongestion);

module.exports = router;
