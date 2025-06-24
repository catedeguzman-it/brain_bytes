const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brainbytes';

let db;

async function connectToDatabase() {
  const client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
  db = client.db();
  console.log('✅ Connected to MongoDB');
  return db;
}

function getDb() {
  if (!db) throw new Error('❌ DB not connected yet!');
  return db;
}

module.exports = { connectToDatabase, getDb };
