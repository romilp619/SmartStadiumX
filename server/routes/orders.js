const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrder, updateOrderStatus, getStallOrders, getActiveStallOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('fan'), placeOrder);
router.get('/my', protect, authorize('fan'), getMyOrders);
router.get('/stall/:stallId', protect, authorize('vendor', 'admin'), getStallOrders);
router.get('/stall/:stallId/active', protect, authorize('vendor', 'admin'), getActiveStallOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateOrderStatus);

module.exports = router;
