const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  fan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stall: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodStall', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'placed'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'wallet', 'upi'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'paid'
  },
  estimatedReadyTime: { type: Number, default: 15 }, // minutes
  deliveryLocation: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  rewardPointsEarned: { type: Number, default: 0 },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }]
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
