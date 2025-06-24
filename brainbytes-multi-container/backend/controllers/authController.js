const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const { createSession } = require('../models/sessionModels');
const { getDb } = require('../models/db'); // Assumes db.js exports getDb()

// POST /api/register
const registerUser = async (req, res) => {
  const db = getDb();

  try {
    const { name, email, password } = req.body;

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = result.insertedId;
    const sessionId = await createSession(userId);
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ userId, sessionId, token });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// POST /api/login
const loginUser = async (req, res) => {
  const db = getDb();

  try {
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    const sessionId = await createSession(user._id);

    res.json({
      token,
      sessionId,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

// GET /api/protected
const protectedRoute = (req, res) => {
  res.json({ message: `Welcome ${req.user.email}` });
};

module.exports = {
  registerUser,
  loginUser,
  protectedRoute,
};
