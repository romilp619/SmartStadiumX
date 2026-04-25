const Zone = require('../models/Zone');

// @GET /api/zones
exports.getZones = async (req, res, next) => {
  try {
    const zones = await Zone.find().populate('nearbyStalls', 'name stallNumber isOpen estimatedWaitTime');
    res.json({ success: true, zones });
  } catch (err) { next(err); }
};

// @GET /api/zones/:id
exports.getZone = async (req, res, next) => {
  try {
    const zone = await Zone.findById(req.params.id).populate('nearbyStalls');
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    res.json({ success: true, zone });
  } catch (err) { next(err); }
};

// @PUT /api/zones/:id/congestion (admin)
exports.updateCongestion = async (req, res, next) => {
  try {
    const { currentOccupancy, congestionLevel, isRerouting, rerouteMessage } = req.body;
    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      { currentOccupancy, congestionLevel, isRerouting, rerouteMessage },
      { new: true }
    );
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

    // Emit via socket (attached to req)
    if (req.io) {
      req.io.emit('zone:update', { zone });
    }

    res.json({ success: true, zone });
  } catch (err) { next(err); }
};

// @POST /api/zones (admin)
exports.createZone = async (req, res, next) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json({ success: true, zone });
  } catch (err) { next(err); }
};

// @GET /api/zones/stats
exports.getZoneStats = async (req, res, next) => {
  try {
    const zones = await Zone.find();
    const stats = {
      total: zones.length,
      low: zones.filter(z => z.congestionLevel === 'low').length,
      medium: zones.filter(z => z.congestionLevel === 'medium').length,
      high: zones.filter(z => z.congestionLevel === 'high').length,
      critical: zones.filter(z => z.congestionLevel === 'critical').length,
      rerouting: zones.filter(z => z.isRerouting).length,
      totalCapacity: zones.reduce((sum, z) => sum + z.capacity, 0),
      totalOccupancy: zones.reduce((sum, z) => sum + z.currentOccupancy, 0),
    };
    res.json({ success: true, stats });
  } catch (err) { next(err); }
};
