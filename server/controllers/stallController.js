const FoodStall = require('../models/FoodStall');

// @GET /api/stalls
exports.getStalls = async (req, res, next) => {
  try {
    const { zone } = req.query;
    const query = zone ? { zone } : {};
    const stalls = await FoodStall.find(query).populate('vendor', 'name email');
    res.json({ success: true, stalls });
  } catch (err) { next(err); }
};

// @GET /api/stalls/:id
exports.getStall = async (req, res, next) => {
  try {
    const stall = await FoodStall.findById(req.params.id).populate('vendor', 'name email');
    if (!stall) return res.status(404).json({ success: false, message: 'Stall not found' });
    res.json({ success: true, stall });
  } catch (err) { next(err); }
};

// @GET /api/stalls/my (vendor)
exports.getMyStall = async (req, res, next) => {
  try {
    const stall = await FoodStall.findOne({ vendor: req.user._id });
    if (!stall) return res.status(404).json({ success: false, message: 'No stall found for this vendor' });
    res.json({ success: true, stall });
  } catch (err) { next(err); }
};

// @PUT /api/stalls/:id/menu (vendor)
exports.updateMenu = async (req, res, next) => {
  try {
    const { menu } = req.body;
    const stall = await FoodStall.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user._id },
      { menu },
      { new: true }
    );
    if (!stall) return res.status(403).json({ success: false, message: 'Not authorized or stall not found' });
    res.json({ success: true, stall });
  } catch (err) { next(err); }
};

// @PUT /api/stalls/:id/status (vendor)
exports.updateStatus = async (req, res, next) => {
  try {
    const { isOpen, currentQueueLength, estimatedWaitTime } = req.body;
    const stall = await FoodStall.findByIdAndUpdate(
      req.params.id,
      { isOpen, currentQueueLength, estimatedWaitTime },
      { new: true }
    );
    if (req.io) req.io.emit('stall:update', { stallId: stall._id, isOpen, currentQueueLength, estimatedWaitTime });
    res.json({ success: true, stall });
  } catch (err) { next(err); }
};

// @POST /api/stalls (admin)
exports.createStall = async (req, res, next) => {
  try {
    const stall = await FoodStall.create(req.body);
    res.status(201).json({ success: true, stall });
  } catch (err) { next(err); }
};

// @POST /api/stalls/:id/menu/item (vendor adds single item)
exports.addMenuItem = async (req, res, next) => {
  try {
    const stall = await FoodStall.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!stall) return res.status(403).json({ success: false, message: 'Not authorized' });
    stall.menu.push(req.body);
    await stall.save();
    res.status(201).json({ success: true, stall });
  } catch (err) { next(err); }
};

// @DELETE /api/stalls/:id/menu/:itemId (vendor)
exports.removeMenuItem = async (req, res, next) => {
  try {
    const stall = await FoodStall.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!stall) return res.status(403).json({ success: false, message: 'Not authorized' });
    stall.menu = stall.menu.filter(item => item._id.toString() !== req.params.itemId);
    await stall.save();
    res.json({ success: true, stall });
  } catch (err) { next(err); }
};
