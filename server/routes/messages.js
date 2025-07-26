import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

// Middleware to ensure user is authenticated (assuming you have auth middleware)
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await mongoose.model('User').findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Get messages between two users
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender receiver', 'username email')
      .sort({ timestamp: 1 });

    // Decrypt messages
    const decryptedMessages = messages.map((msg) => ({
      ...msg._doc,
      message: decrypt(
        { encryptedData: msg.encryptedMessage, iv: msg.iv },
        process.env.AES_SECRET
      ),
    }));

    res.json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

export default router;