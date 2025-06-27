// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserById } = require('../models/userModels');

// GET /api/user/:id
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Ensure the full profile info is sent to the frontend
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
