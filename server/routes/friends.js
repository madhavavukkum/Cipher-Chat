import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Send Friend Request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    const existingRequest = targetUser.friendRequests.find(
      (r) => r.from.toString() === req.user._id.toString() && r.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const currentUser = await User.findById(req.user._id);
    const reverseRequest = currentUser.friendRequests.find(
      (r) => r.from.toString() === userId && r.status === 'pending'
    );

    if (reverseRequest) {
      return res.status(400).json({
        message: 'This user has already sent you a friend request. Check your requests.',
      });
    }

    targetUser.friendRequests.push({ from: req.user._id, status: 'pending' });
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error while sending friend request' });
  }
});

// Get Friend Requests
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'friendRequests.from',
      'username email isOnline lastSeen isGuest bio'
    );

    const pendingRequests = user.friendRequests.filter((r) => r.status === 'pending');

    res.json(pendingRequests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error while fetching friend requests' });
  }
});

// Accept/Reject Friend Request
router.post('/request/respond', authMiddleware, async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
      return res.status(400).json({ message: 'Request ID and action are required' });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be accept or reject' });
    }

    const user = await User.findById(req.user._id);
    const request = user.friendRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    if (action === 'accept') {
      user.friends.push(request.from);
      const sender = await User.findById(request.from);
      if (sender) {
        sender.friends.push(user._id);
        await sender.save();
      }
      request.status = 'accepted';
    } else {
      request.status = 'rejected';
    }

    await user.save();

    res.json({ message: `Friend request ${action}ed successfully` });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Server error while responding to friend request' });
  }
});

// Get Friends
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'friends',
      'username email isOnline lastSeen isGuest bio'
    );

    const sortedFriends = user.friends.sort((a, b) => {
      if (a.isOnline !== b.isOnline) {
        return b.isOnline - a.isOnline;
      }
      return a.username.localeCompare(b.username);
    });

    res.json(sortedFriends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error while fetching friends' });
  }
});

// Remove Friend
router.delete('/:friendId', authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!friendId) {
      return res.status(400).json({ message: 'Friend ID is required' });
    }

    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'User is not in your friends list' });
    }

    user.friends.pull(friendId);
    friend.friends.pull(user._id);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error while removing friend' });
  }
});

export default router;