const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  fan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactions: [{
    type: { type: String, enum: ['earned', 'redeemed'], required: true },
    points: { type: Number, required: true },
    description: { type: String, required: true },
    reference: { type: String, default: '' }, // orderId or offerId
    createdAt: { type: Date, default: Date.now },
  }],
  totalEarned: { type: Number, default: 0 },
  totalRedeemed: { type: Number, default: 0 },
}, { timestamps: true });

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pointsCost: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // percentage
  isActive: { type: Boolean, default: true },
  validUntil: { type: Date },
  category: { type: String, default: 'food' },
  icon: { type: String, default: '🎁' },
}, { timestamps: true });

module.exports = {
  Reward: mongoose.model('Reward', rewardSchema),
  Offer: mongoose.model('Offer', offerSchema),
};
