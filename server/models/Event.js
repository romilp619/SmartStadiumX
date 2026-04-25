const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sport: { type: String, default: 'Football' },
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  teamALogo: { type: String, default: '' },
  teamBLogo: { type: String, default: '' },
  date: { type: Date, required: true },
  kickoffTime: { type: String, default: '20:00' },
  venue: { type: String, default: 'SmartStadiumX Arena' },
  totalCapacity: { type: Number, default: 60000 },
  currentAttendance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  zones: [{ type: String }],
  gates: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
