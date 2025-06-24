const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  protectedRoute
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/protected', authMiddleware, protectedRoute);

module.exports = router;
