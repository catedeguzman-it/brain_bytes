const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/brainbytes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// Define a simple schema for messages
const messageSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BrainBytes API' });
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new message
app.post('/api/messages', async (req, res) => {
  try {
    const message = new Message({
      text: req.body.text
    });
    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
