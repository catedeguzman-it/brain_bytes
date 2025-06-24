const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db');

exports.createSession = async (userId) => {
  const db = getDb();
  const session = {
    sessionId: crypto.randomUUID(),
    userId: new ObjectId(userId),
    startedAt: new Date(),
    lastActiveAt: new Date(),
    isActive: true
  };
  const result = await db.collection('sessions').insertOne(session);
  return result.insertedId.toString();
};

exports.updateSessionActivity = async (sessionId) => {
  const db = getDb();
  await db.collection('sessions').updateOne(
    { _id: new ObjectId(sessionId) },
    { $set: { lastActiveAt: new Date() } }
  );
};
