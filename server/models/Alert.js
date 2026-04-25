const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['emergency', 'gate', 'match', 'crowd', 'general'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  targetRoles: [{ type: String, enum: ['fan', 'admin', 'staff', 'vendor', 'all'] }],
  targetZone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
