// setup.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brainbytes';

async function runSetup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@brainbytes.ai' });
    if (!existing) {
      const admin = new User({
        name: 'Admin',
        email: 'admin@brainbytes.ai',
        password: 'admin123' // Will be hashed automatically
      });

      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Setup error:', err);
    process.exit(1);
  }
}

runSetup();
// This script connects to MongoDB and creates an admin user if it doesn't exist.