const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI model
aiService.initializeAI();

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

// Define schemas
const messageSchema = new mongoose.Schema({
  text: String,
  isUser: { type: Boolean, default: true },
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
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new message and get AI response
app.post('/api/messages', async (req, res) => {
  try {
    // Save user message
    const userMessage = new Message({
      text: req.body.text,
      isUser: true
    });
    await userMessage.save();
    
    // Generate AI response with a 15-second overall timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );
    
    const aiResultPromise = aiService.generateResponse(req.body.text);
    
    // Race between the AI response and the timeout
    const aiResult = await Promise.race([aiResultPromise, timeoutPromise])
      .catch(error => {
        console.error('AI response timed out or failed:', error);
        return {
          category: 'error',
          response: "I'm sorry, but I couldn't process your request in time. Please try again with a simpler question."
        };
      });
    
    // Save AI response
    const aiMessage = new Message({
      text: aiResult.response,
      isUser: false
    });
    await aiMessage.save();
    
    // Return both messages
    res.status(201).json({
      userMessage,
      aiMessage,
      category: aiResult.category
    });
  } catch (err) {
    console.error('Error in /api/messages route:', err);
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
