require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS (8.8.8.8) for SRV lookups
// This bypasses system DNS which often blocks MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;

  // ── Try Atlas first ────────────────────────────────────────────────
  if (atlasUri) {
    try {
      await mongoose.connect(atlasUri, {
        dbName: 'smartstadiumx',
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        family: 4, // Force IPv4 — avoids Windows IPv6 DNS resolution issues
      });
      console.log(`✅ MongoDB Atlas connected: ${mongoose.connection.host}`);
      return;
    } catch (atlasErr) {
      console.warn(`⚠️  Atlas connection failed (${atlasErr.message})`);
      console.warn('🔄  Falling back to in-memory MongoDB...');
    }
  }

  // ── Fallback: in-memory MongoDB ────────────────────────────────────
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log('✅ MongoDB Memory Server connected (offline fallback)');
    console.log('   ℹ️  Data will NOT persist between restarts in this mode.');
  } catch (memErr) {
    console.error('❌ Both Atlas and Memory Server failed:', memErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB disconnected');
};

module.exports = { connectDB, disconnectDB };

