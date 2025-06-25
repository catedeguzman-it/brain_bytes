const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/brainbytes'; // updated for Docker

let db;

async function connectToDatabase() {
  db = client.db();
  console.log("🔎 MONGO_URI:", process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
  return db;
}

function getDb() {
  if (!db) throw new Error('❌ DB not connected yet!');
  return db;
}

module.exports = { connectToDatabase, getDb };
