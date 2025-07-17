const express = require('express');
const router = express.Router();
const { getDb } = require('../models/db');

// ─── POST: Add Material ─────────────────────────────
router.post('/materials', async (req, res) => {
  const db = getDb();
  if (!db) {
    console.error('❌ Database not initialized. getDb() returned null');
    return res.status(500).json({ error: 'Database connection failed' });
  }

  const { subject, material } = req.body;
  console.log('🔍 Incoming material:', { subject, material });

  if (!subject || !material) {
    console.warn('⚠️ Missing subject or material');
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const exists = await db.collection('materials').findOne({ subject, material });
    if (exists) {
      console.warn('⚠️ Material already exists:', subject, material);
      return res.status(409).json({ error: 'Material already exists' });
    }

    const result = await db.collection('materials').insertOne({ subject, material });
    console.log('✅ Material inserted:', result.insertedId);
    res.status(201).json({ message: 'Material saved', id: result.insertedId });
  } catch (err) {
    console.error('❌ Failed to save material:', err);
    res.status(500).json({ error: 'Failed to save material' });
  }
});

// ─── GET: Retrieve All Materials ────────────────────
router.get('/materials', async (req, res) => {
  const db = getDb();
  if (!db) {
    console.error('❌ Database not initialized. getDb() returned null');
    return res.status(500).json({ error: 'Database connection failed' });
  }

  try {
    const materials = await db.collection('materials').find().toArray();
    res.json(materials);
  } catch (err) {
    console.error('❌ Failed to fetch materials:', err);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

module.exports = router;
