const Order = require('../models/Order');
const User = require('../models/User');
const Zone = require('../models/Zone');
const FoodStall = require('../models/FoodStall');
const Event = require('../models/Event');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, zones, stalls, events, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Zone.find(),
      FoodStall.find(),
      Event.find({ status: { $in: ['live', 'upcoming'] } }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('fan', 'name').populate('stall', 'name'),
    ]);
    const totalRevenue = stalls.reduce((sum, s) => sum + s.revenue, 0);
    const totalOccupancy = zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
    const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
    const activeOrders = await Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'preparing'] } });
    res.json({
      success: true,
      stats: { totalUsers, totalOrders, totalRevenue, totalOccupancy, totalCapacity, activeOrders, liveEvents: events.filter(e => e.status === 'live').length },
      zones, recentOrders, events,
    });
  } catch (err) { next(err); }
};

exports.getRevenueReport = async (req, res, next) => {
  try {
    const stalls = await FoodStall.find().select('name revenue totalOrdersToday stallNumber zone');
    res.json({ success: true, stalls });
  } catch (err) { next(err); }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const fans = await User.countDocuments({ role: 'fan' });
    const staff = await User.countDocuments({ role: 'staff' });
    const vendors = await User.countDocuments({ role: 'vendor' });
    res.json({ success: true, stats: { fans, staff, vendors } });
  } catch (err) { next(err); }
};
