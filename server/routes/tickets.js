const express = require('express');
const router = express.Router();
const { getMyTickets, getTicket, createTicket, getEventTickets } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyTickets);
router.get('/event/:eventId', protect, authorize('admin'), getEventTickets);
router.get('/:id', protect, getTicket);
router.post('/', protect, authorize('admin'), createTicket);

module.exports = router;
