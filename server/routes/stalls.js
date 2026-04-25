const express = require('express');
const router = express.Router();
const { getStalls, getStall, getMyStall, updateMenu, updateStatus, createStall, addMenuItem, removeMenuItem } = require('../controllers/stallController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getStalls);
router.get('/my', protect, authorize('vendor'), getMyStall);
router.get('/:id', protect, getStall);
router.post('/', protect, authorize('admin'), createStall);
router.put('/:id/menu', protect, authorize('vendor'), updateMenu);
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateStatus);
router.post('/:id/menu/item', protect, authorize('vendor'), addMenuItem);
router.delete('/:id/menu/:itemId', protect, authorize('vendor'), removeMenuItem);

module.exports = router;
