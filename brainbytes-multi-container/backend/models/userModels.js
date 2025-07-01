// models/userModel.js
const { getDb } = require('./db');
const { ObjectId } = require('mongodb');

exports.createUser = async ({ email, name, passwordHash }) => {
  const db = getDb();
  const result = await db.collection('users').insertOne({
    email,
    name,
    passwordHash,
    createdAt: new Date()
  });
  return result.insertedId;
};

exports.getUserById = async (id) => {
  const db = getDb();

  // 🛑 Validate ObjectId before using it
  if (!ObjectId.isValid(id)) {
    console.warn(`Invalid user ID provided: ${id}`);
    return null;
  }

  return await db.collection('users').findOne({ _id: new ObjectId(id) });
};

exports.getUserByEmail = async (email) => {
  const db = getDb();
  return await db.collection('users').findOne({ email });
};
