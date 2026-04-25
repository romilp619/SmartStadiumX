const Order = require('../models/Order');
const FoodStall = require('../models/FoodStall');
const User = require('../models/User');
const { Reward } = require('../models/Reward');

// @POST /api/orders
exports.placeOrder = async (req, res, next) => {
  try {
    const { stallId, items, paymentMethod, deliveryLocation, specialInstructions } = req.body;
    const stall = await FoodStall.findById(stallId);
    if (!stall) return res.status(404).json({ success: false, message: 'Stall not found' });
    if (!stall.isOpen) return res.status(400).json({ success: false, message: 'Stall is currently closed' });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const rewardPointsEarned = Math.floor(totalAmount / 10); // 1 point per ₹10

    const order = await Order.create({
      fan: req.user._id,
      stall: stallId,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'card',
      deliveryLocation,
      specialInstructions,
      rewardPointsEarned,
      statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
    });

    // Update stall stats
    await FoodStall.findByIdAndUpdate(stallId, {
      $inc: { totalOrdersToday: 1, revenue: totalAmount, currentQueueLength: 1 }
    });

    // Add reward points to fan
    await User.findByIdAndUpdate(req.user._id, { $inc: { rewardPoints: rewardPointsEarned } });
    await Reward.findOneAndUpdate(
      { fan: req.user._id },
      {
        $push: { transactions: { type: 'earned', points: rewardPointsEarned, description: `Order #${order.orderId}`, reference: order.orderId } },
        $inc: { totalEarned: rewardPointsEarned }
      },
      { upsert: true }
    );

    // Notify via socket
    if (req.io) {
      req.io.to(`stall:${stallId}`).emit('order:new', { order });
      req.io.to(`user:${req.user._id}`).emit('order:placed', { order });
    }

    const populated = await Order.findById(order._id).populate('stall', 'name stallNumber zone');
    res.status(201).json({ success: true, order: populated });
  } catch (err) { next(err); }
};

// @GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ fan: req.user._id })
      .populate('stall', 'name stallNumber zone')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('stall fan');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @PUT /api/orders/:id/status (vendor/admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });

    if (status === 'delivered') {
      await FoodStall.findByIdAndUpdate(order.stall, { $inc: { currentQueueLength: -1 } });
    }

    await order.save();

    if (req.io) {
      req.io.to(`user:${order.fan}`).emit('order:statusUpdate', { orderId: order._id, status, note });
      req.io.to(`stall:${order.stall}`).emit('order:statusUpdate', { orderId: order._id, status });
    }

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @GET /api/orders/stall/:stallId (vendor)
exports.getStallOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ stall: req.params.stallId })
      .populate('fan', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @GET /api/orders/active/stall/:stallId (vendor - active only)
exports.getActiveStallOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      stall: req.params.stallId,
      status: { $in: ['placed', 'confirmed', 'preparing'] }
    }).populate('fan', 'name').sort({ createdAt: 1 });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};
