const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  congestionLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  restrooms: { type: Number, default: 2 },
  exits: [{ type: String }],
  nearbyStalls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodStall' }],
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isRerouting: { type: Boolean, default: false },
  rerouteMessage: { type: String, default: '' },
  coordinates: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },
  }
}, { timestamps: true });

module.exports = mongoose.model('Zone', zoneSchema);
