const express = require('express');
const router = express.Router();
const { getMyRewards, getOffers, redeemOffer } = require('../controllers/rewardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my', protect, authorize('fan'), getMyRewards);
router.get('/offers', protect, getOffers);
router.post('/redeem/:offerId', protect, authorize('fan'), redeemOffer);

module.exports = router;
