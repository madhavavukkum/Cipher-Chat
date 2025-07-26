import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, bio } = req.body;

    // Validation
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const trimmedUsername = username.trim();

    // Check if username is taken by another user
    const existingUser = await User.findOne({
      username: trimmedUsername,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Update user
    const updateData = { username: trimmedUsername };
    if (bio !== undefined) {
      updateData.bio = bio.trim().substring(0, 200); // Limit bio to 200 characters
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        isGuest: user.isGuest,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Search Users
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const searchQuery = q.trim();

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('username email isOnline lastSeen isGuest bio')
      .sort({ username: 1 })
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error during user search' });
  }
});

// Get All Users with Pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username email isOnline lastSeen isGuest bio')
      .sort({ isOnline: -1, username: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ _id: { $ne: req.user._id } });

    res.json({
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasPrev: page > 1,
        hasNext: skip + users.length < total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

export default router;