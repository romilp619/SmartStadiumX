const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, default: () => uuidv4().slice(0, 8).toUpperCase() },
  fan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  seat: {
    section: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
  },
  gate: { type: String, required: true },
  zone: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['general', 'vip', 'premium', 'family'],
    default: 'general'
  },
  qrData: { type: String },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
