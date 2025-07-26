import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, isGuest: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if guest
    if (user.isGuest) {
      return res.status(400).json({ message: 'Guest users cannot login with email/password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, isGuest: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Guest Login
router.post('/guest-login', async (req, res) => {
  try {
    const { username } = req.body;

    // Validation
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const trimmedUsername = username.trim();

    // Check if username exists
    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create guest user
    const guestUser = new User({
      username: trimmedUsername,
      email: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@temp.local`,
      password: await bcrypt.hash(`guest_temp_${Date.now()}`, 10),
      isGuest: true,
      isOnline: true
    });

    await guestUser.save();

    // Generate token
    const token = jwt.sign(
      { userId: guestUser._id, isGuest: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Guest login successful',
      token,
      user: {
        id: guestUser._id,
        username: guestUser.username,
        email: guestUser.email,
        isGuest: guestUser.isGuest,
        isOnline: guestUser.isOnline
      }
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Server error during guest login' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isGuest) {
      // Delete guest's messages
      await Message.deleteMany({
        $or: [{ sender: user._id }, { receiver: user._id }]
      });

      // Remove guest from friends lists
      await User.updateMany(
        { friends: user._id },
        { $pull: { friends: user._id } }
      );

      await User.updateMany(
        { 'friendRequests.from': user._id },
        { $pull: { friendRequests: { from: user._id } } }
      );

      // Delete guest user
      await User.findByIdAndDelete(user._id);

      res.json({ message: 'Guest session ended - all data deleted' });
    } else {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();

      res.json({ message: 'Logged out successfully' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;