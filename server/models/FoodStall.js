const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['burger', 'pizza', 'drinks', 'snacks', 'desserts', 'combo'],
    default: 'snacks'
  },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  prepTime: { type: Number, default: 10 }, // minutes
  calories: { type: Number, default: 0 },
});

const foodStallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stallNumber: { type: String, required: true, unique: true },
  zone: { type: String, required: true },
  cuisine: { type: String, default: 'Multi-cuisine' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  menu: [menuItemSchema],
  isOpen: { type: Boolean, default: true },
  currentQueueLength: { type: Number, default: 0 },
  estimatedWaitTime: { type: Number, default: 5 }, // minutes
  rating: { type: Number, default: 4.2, min: 1, max: 5 },
  totalOrdersToday: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('FoodStall', foodStallSchema);
