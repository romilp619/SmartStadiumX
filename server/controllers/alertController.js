const Alert = require('../models/Alert');

// @POST /api/alerts (admin)
exports.createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create({ ...req.body, sentBy: req.user._id });

    if (req.io) {
      req.io.emit('alert:new', { alert });
    }

    res.status(201).json({ success: true, alert });
  } catch (err) { next(err); }
};

// @GET /api/alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const { active } = req.query;
    const query = active === 'true' ? { isActive: true } : {};
    const alerts = await Alert.find(query)
      .populate('sentBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, alerts });
  } catch (err) { next(err); }
};

// @PUT /api/alerts/:id/deactivate (admin)
exports.deactivateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    if (req.io) req.io.emit('alert:deactivated', { alertId: alert._id });
    res.json({ success: true, alert });
  } catch (err) { next(err); }
};

// @PUT /api/alerts/:id/read (fan marks as read)
exports.markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );
    res.json({ success: true, alert });
  } catch (err) { next(err); }
};

// @GET /api/alerts/active
exports.getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) { next(err); }
};
