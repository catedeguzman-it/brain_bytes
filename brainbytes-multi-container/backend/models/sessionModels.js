const crypto = require('crypto');
const { getDb } = require('./db');

exports.createSession = async (userId) => {
  const db = getDb();
  const sessionId = crypto.randomUUID();

  const session = {
    sessionId,
    userId: userId || null, // null for guests
    startedAt: new Date(),
    lastActiveAt: new Date(),
    isActive: true,
    isGuest: !userId // flag for guest sessions
  };

  await db.collection('sessions').insertOne(session);
  return sessionId;
};

exports.updateSessionActivity = async (sessionId) => {
  const db = getDb();
  await db.collection('sessions').updateOne(
    { sessionId }, // match by UUID string
    { $set: { lastActiveAt: new Date() } }
  );
};