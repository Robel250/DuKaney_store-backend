import express from 'express';
import { Message } from '../Models/message.js';
import authenticate from '../middleware/authenticate.js'; // Authentication middleware

const router = express.Router();

// Send a message
router.post('/send', authenticate, async (req, res) => {
  const { receiver, message } = req.body;

  try {
    const newMessage = new Message({
      sender: req.userId,
      receiver,
      message,
    });
    await newMessage.save();
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Fetch messages between two users
router.get('/conversations/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

export default router;
