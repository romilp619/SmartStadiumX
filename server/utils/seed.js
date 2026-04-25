const User = require('../models/User');
const Event = require('../models/Event');
const Zone = require('../models/Zone');
const FoodStall = require('../models/FoodStall');
const Ticket = require('../models/Ticket');
const { Offer } = require('../models/Reward');
const Order = require('../models/Order');

const seed = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Users
    const admin = await User.create({ name: 'Alex Admin', email: 'admin@stadium.com', password: 'password123', role: 'admin' });
    const fan1 = await User.create({ name: 'James Wilson', email: 'fan@stadium.com', password: 'password123', role: 'fan', rewardPoints: 250 });
    const fan2 = await User.create({ name: 'Sarah Connor', email: 'sarah@stadium.com', password: 'password123', role: 'fan', rewardPoints: 120 });
    const staff1 = await User.create({ name: 'Mike Torres', email: 'staff@stadium.com', password: 'password123', role: 'staff', assignedZone: 'Zone A' });
    const vendor1 = await User.create({ name: 'Chef Raj Kumar', email: 'vendor@stadium.com', password: 'password123', role: 'vendor' });
    const vendor2 = await User.create({ name: 'Pizza Pete', email: 'vendor2@stadium.com', password: 'password123', role: 'vendor' });
    console.log('✅ Users created');

    // Event
    const event = await Event.create({
      title: 'Premier League: City Wolves vs Red Eagles',
      sport: 'Football',
      teamA: 'City Wolves',
      teamB: 'Red Eagles',
      date: new Date(Date.now() + 2 * 60 * 60 * 1000),
      kickoffTime: '20:00',
      venue: 'SmartStadiumX Arena',
      totalCapacity: 60000,
      currentAttendance: 48500,
      status: 'live',
      zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'VIP'],
      gates: ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4'],
    });
    console.log('✅ Event created');

    // Zones
    const zoneData = [
      { name: 'zone-a', label: 'Zone A - North Stand', capacity: 15000, currentOccupancy: 13200, congestionLevel: 'high', restrooms: 4, exits: ['Exit A1', 'Exit A2'], coordinates: { x: 10, y: 10, width: 200, height: 150 } },
      { name: 'zone-b', label: 'Zone B - South Stand', capacity: 15000, currentOccupancy: 9800, congestionLevel: 'medium', restrooms: 4, exits: ['Exit B1', 'Exit B2'], coordinates: { x: 10, y: 200, width: 200, height: 150 } },
      { name: 'zone-c', label: 'Zone C - East Stand', capacity: 12000, currentOccupancy: 5400, congestionLevel: 'low', restrooms: 3, exits: ['Exit C1'], coordinates: { x: 250, y: 100, width: 150, height: 200 } },
      { name: 'zone-d', label: 'Zone D - West Stand', capacity: 12000, currentOccupancy: 11200, congestionLevel: 'critical', restrooms: 3, exits: ['Exit D1', 'Exit D2'], isRerouting: true, rerouteMessage: 'Zone D at capacity. Please use Zone C entrance.', coordinates: { x: 10, y: 10, width: 150, height: 200 } },
      { name: 'zone-vip', label: 'VIP Lounge', capacity: 6000, currentOccupancy: 3100, congestionLevel: 'low', restrooms: 6, exits: ['VIP Exit 1', 'VIP Exit 2'], coordinates: { x: 200, y: 200, width: 150, height: 100 } },
    ];
    const zones = await Zone.insertMany(zoneData);
    console.log('✅ Zones created');

    // Food Stalls
    const stall1 = await FoodStall.create({
      name: "Raj's Indian Kitchen",
      stallNumber: 'S-101',
      zone: 'Zone A',
      cuisine: 'Indian',
      vendor: vendor1._id,
      isOpen: true,
      currentQueueLength: 8,
      estimatedWaitTime: 12,
      rating: 4.7,
      totalOrdersToday: 124,
      revenue: 48600,
      menu: [
        { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 280, category: 'combo', isAvailable: true, prepTime: 12, calories: 650 },
        { name: 'Paneer Tikka', description: 'Grilled cottage cheese with mint chutney', price: 180, category: 'snacks', isAvailable: true, prepTime: 8, calories: 380 },
        { name: 'Mango Lassi', description: 'Chilled mango yogurt drink', price: 80, category: 'drinks', isAvailable: true, prepTime: 2, calories: 220 },
        { name: 'Samosa (2 pcs)', description: 'Crispy pastry with spiced potato filling', price: 60, category: 'snacks', isAvailable: true, prepTime: 3, calories: 250 },
        { name: 'Gulab Jamun', description: 'Soft milk dumplings in sugar syrup', price: 90, category: 'desserts', isAvailable: true, prepTime: 2, calories: 300 },
      ]
    });

    const stall2 = await FoodStall.create({
      name: "Pete's Pizza Palace",
      stallNumber: 'S-205',
      zone: 'Zone B',
      cuisine: 'Italian',
      vendor: vendor2._id,
      isOpen: true,
      currentQueueLength: 3,
      estimatedWaitTime: 6,
      rating: 4.4,
      totalOrdersToday: 89,
      revenue: 31150,
      menu: [
        { name: 'Margherita Pizza (6")', description: 'Classic tomato and mozzarella', price: 220, category: 'pizza', isAvailable: true, prepTime: 8, calories: 520 },
        { name: 'Pepperoni Pizza (6")', description: 'Loaded with pepperoni slices', price: 280, category: 'pizza', isAvailable: true, prepTime: 10, calories: 680 },
        { name: 'BBQ Chicken Burger', description: 'Smoky BBQ sauce with crispy chicken', price: 200, category: 'burger', isAvailable: true, prepTime: 7, calories: 550 },
        { name: 'Loaded Nachos', description: 'Tortilla chips with cheese dip & jalapeños', price: 160, category: 'snacks', isAvailable: true, prepTime: 4, calories: 480 },
        { name: 'Choco Brownie', description: 'Warm fudge brownie with ice cream', price: 120, category: 'desserts', isAvailable: true, prepTime: 3, calories: 420 },
        { name: 'Coke (500ml)', description: 'Ice cold cola', price: 60, category: 'drinks', isAvailable: true, prepTime: 1, calories: 210 },
      ]
    });

    const stall3 = await FoodStall.create({
      name: 'Stadium Grill & Bar',
      stallNumber: 'S-VIP-01',
      zone: 'VIP',
      cuisine: 'American',
      isOpen: true,
      currentQueueLength: 1,
      estimatedWaitTime: 3,
      rating: 4.9,
      totalOrdersToday: 67,
      revenue: 84200,
      menu: [
        { name: 'Prime Beef Burger', description: 'Premium angus beef with truffle mayo', price: 450, category: 'burger', isAvailable: true, prepTime: 10, calories: 780 },
        { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter sauce', price: 680, category: 'combo', isAvailable: true, prepTime: 15, calories: 520 },
        { name: 'Craft Beer (Pint)', description: 'Local craft ale on tap', price: 320, category: 'drinks', isAvailable: true, prepTime: 1, calories: 180 },
        { name: 'Loaded Fries', description: 'Crispy fries with cheese & bacon bits', price: 280, category: 'snacks', isAvailable: true, prepTime: 6, calories: 620 },
      ]
    });

    // Update vendor stall references
    await User.findByIdAndUpdate(vendor1._id, { stallId: stall1._id });
    await User.findByIdAndUpdate(vendor2._id, { stallId: stall2._id });

    // Update zones with nearby stalls
    await Zone.findOneAndUpdate({ name: 'zone-a' }, { nearbyStalls: [stall1._id] });
    await Zone.findOneAndUpdate({ name: 'zone-b' }, { nearbyStalls: [stall2._id] });
    await Zone.findOneAndUpdate({ name: 'zone-vip' }, { nearbyStalls: [stall3._id] });
    console.log('✅ Food stalls created');

    // Tickets for fan1
    await Ticket.create({
      fan: fan1._id,
      event: event._id,
      seat: { section: 'A', row: '12', number: 45 },
      gate: 'Gate 1',
      zone: 'Zone A',
      price: 1500,
      category: 'general',
    });
    await Ticket.create({
      fan: fan2._id,
      event: event._id,
      seat: { section: 'VIP', row: '2', number: 8 },
      gate: 'Gate 4',
      zone: 'VIP',
      price: 8500,
      category: 'vip',
    });
    console.log('✅ Tickets created');

    // Offers
    await Offer.insertMany([
      { title: '10% Off Food Order', description: 'Get 10% off your next food order at any stall', pointsCost: 100, discount: 10, isActive: true, category: 'food', icon: '🍕' },
      { title: 'Free Drink Voucher', description: 'Redeem for any drink (up to ₹80)', pointsCost: 80, discount: 100, isActive: true, category: 'drinks', icon: '🥤' },
      { title: 'Priority Queue Pass', description: 'Skip the queue at any food stall once', pointsCost: 150, discount: 0, isActive: true, category: 'access', icon: '⚡' },
      { title: 'VIP Lounge Access (1 hr)', description: 'Complimentary 1 hour VIP Lounge access', pointsCost: 500, discount: 0, isActive: true, category: 'access', icon: '👑' },
      { title: '20% Off Merchandise', description: '20% discount at stadium merchandise store', pointsCost: 200, discount: 20, isActive: true, category: 'merch', icon: '🛍️' },
    ]);
    console.log('✅ Offers created');

    // Sample orders
    await Order.create({
      fan: fan1._id,
      stall: stall1._id,
      items: [
        { menuItem: 'item1', name: 'Chicken Biryani', price: 280, quantity: 2, subtotal: 560 },
        { menuItem: 'item2', name: 'Mango Lassi', price: 80, quantity: 2, subtotal: 160 },
      ],
      totalAmount: 720,
      status: 'delivered',
      rewardPointsEarned: 72,
      statusHistory: [
        { status: 'placed', note: 'Order placed' },
        { status: 'confirmed', note: 'Order confirmed by vendor' },
        { status: 'preparing', note: 'Chef is preparing your order' },
        { status: 'ready', note: 'Order ready for pickup' },
        { status: 'delivered', note: 'Delivered!' },
      ]
    });

    console.log('✅ Sample orders created');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin:  admin@stadium.com / password123');
    console.log('  Fan:    fan@stadium.com / password123');
    console.log('  Staff:  staff@stadium.com / password123');
    console.log('  Vendor: vendor@stadium.com / password123');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

module.exports = seed;
