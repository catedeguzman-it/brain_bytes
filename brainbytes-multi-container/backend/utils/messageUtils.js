const { getDb } = require('../models/db');
const { ObjectId } = require('mongodb');

async function getMessagesBySession(sessionId) {
  const db = getDb();

  // You must convert sessionId string to ObjectId
  const objectId = new ObjectId(sessionId);
  const messages = await db.collection('messages')
    .find({ sessionId: objectId })
    .sort({ timestamp: 1 })
    .toArray();

  return messages;
}

module.exports = { getMessagesBySession };
