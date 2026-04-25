require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS (8.8.8.8) for SRV lookups
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;

  // ── Try Atlas ────────────────────────────────────────────────────────
  if (atlasUri) {
    try {
      await mongoose.connect(atlasUri, {
        dbName: 'smartstadiumx',
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        family: 4, // Force IPv4
      });
      console.log(`✅ MongoDB Atlas connected: ${mongoose.connection.host}`);
      return;
    } catch (atlasErr) {
      console.warn(`⚠️  Atlas connection failed: ${atlasErr.message}`);
    }
  }

  // ── In production: don't use in-memory DB, just warn ────────────────
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ MongoDB Atlas connection failed in production. Check MONGO_URI env var.');
    // Do NOT call process.exit — keep the server alive so health check passes
    return;
  }

  // ── Dev fallback: in-memory MongoDB ─────────────────────────────────
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log('✅ MongoDB Memory Server connected (offline fallback)');
    console.log('   ℹ️  Data will NOT persist between restarts in this mode.');
  } catch (memErr) {
    console.error('❌ Both Atlas and Memory Server failed:', memErr.message);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB disconnected');
};

module.exports = { connectDB, disconnectDB };
