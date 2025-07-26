import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// AES Encryption/Decryption functions
const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update(process.env.AES_SECRET).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
  };
}

function decrypt(encryptedData, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Get Messages
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ],
      isDeleted: false
    })
      .populate('sender receiver', 'username email isGuest')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const decryptedMessages = messages.map(msg => {
      try {
        return {
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          message: decrypt(msg.encryptedMessage, msg.iv),
          timestamp: msg.timestamp,
          isRead: msg.isRead,
          messageType: msg.messageType,
          editedAt: msg.editedAt
        };
      } catch (decryptError) {
        console.error('Decryption error:', decryptError);
        return {
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          message: '[Message could not be decrypted]',
          timestamp: msg.timestamp,
          isRead: msg.isRead,
          messageType: msg.messageType,
          editedAt: msg.editedAt
        };
      }
    }).reverse();

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ],
      isDeleted: false
    });

    res.json({
      messages: decryptedMessages,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

// Get Unread Message Count
router.get('/unread/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Message.countDocuments({
      sender: userId,
      receiver: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error while fetching unread count' });
  }
});

// Delete Message
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
});

export default router;