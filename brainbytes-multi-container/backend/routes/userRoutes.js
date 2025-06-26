const express = require('express');
const router = express.Router();
const { getUserById } = require('../models/userModels');

// GET /api/user/:id
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ email: user.email, name: user.name, id: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
