const { Reward, Offer } = require('../models/Reward');
const User = require('../models/User');

exports.getMyRewards = async (req, res, next) => {
  try {
    const reward = await Reward.findOne({ fan: req.user._id });
    const user = await User.findById(req.user._id).select('rewardPoints');
    res.json({ success: true, reward, currentPoints: user.rewardPoints });
  } catch (err) { next(err); }
};

exports.getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ isActive: true });
    res.json({ success: true, offers });
  } catch (err) { next(err); }
};

exports.redeemOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.offerId);
    if (!offer || !offer.isActive) return res.status(404).json({ success: false, message: 'Offer not found or expired' });
    const user = await User.findById(req.user._id);
    if (user.rewardPoints < offer.pointsCost) {
      return res.status(400).json({ success: false, message: 'Insufficient reward points' });
    }
    user.rewardPoints -= offer.pointsCost;
    await user.save();
    await Reward.findOneAndUpdate(
      { fan: req.user._id },
      { $push: { transactions: { type: 'redeemed', points: offer.pointsCost, description: `Redeemed: ${offer.title}`, reference: offer._id.toString() } }, $inc: { totalRedeemed: offer.pointsCost } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Offer redeemed!', offer, remainingPoints: user.rewardPoints });
  } catch (err) { next(err); }
};
