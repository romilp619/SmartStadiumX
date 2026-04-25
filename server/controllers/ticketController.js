const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const QRCode = require('qrcode');

// @GET /api/tickets/my
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ fan: req.user._id })
      .populate('event', 'title date teamA teamB venue status')
      .sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (err) { next(err); }
};

// @GET /api/tickets/:id
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('fan', 'name email');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Only owner or admin can view
    if (ticket.fan._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Generate QR data
    const qrPayload = JSON.stringify({
      ticketId: ticket.ticketId,
      fan: ticket.fan.name,
      seat: ticket.seat,
      gate: ticket.gate,
      zone: ticket.zone,
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 300, margin: 2 });

    res.json({ success: true, ticket, qrDataUrl });
  } catch (err) { next(err); }
};

// @POST /api/tickets (Admin can assign tickets)
exports.createTicket = async (req, res, next) => {
  try {
    const { fan, eventId, seat, gate, zone, price, category } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const ticket = await Ticket.create({
      fan, event: eventId, seat, gate, zone, price, category
    });
    res.status(201).json({ success: true, ticket });
  } catch (err) { next(err); }
};

// @GET /api/tickets/event/:eventId (admin)
exports.getEventTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId })
      .populate('fan', 'name email');
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) { next(err); }
};
