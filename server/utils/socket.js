import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { encrypt, decrypt } from './encryption.js';

const connectedUsers = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.userId})`);

    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.user.username,
      lastSeen: new Date()
    });

    // Join personal room
    socket.join(socket.userId);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Notify friends about online status
    const userWithFriends = await User.findById(socket.userId).populate('friends', '_id');
    userWithFriends.friends.forEach(friend => {
      socket.to(friend._id.toString()).emit('userOnline', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, message } = data;

        if (!receiverId || !message || typeof message !== 'string' || !message.trim()) {
          return socket.emit('messageError', { error: 'Invalid message data' });
        }

        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          return socket.emit('messageError', { error: 'Recipient not found' });
        }

        // Encrypt message
        const encrypted = encrypt(message.trim(), process.env.AES_SECRET);

        // Save message to database
        const newMessage = new Message({
          sender: socket.userId,
          receiver: receiverId,
          encryptedMessage: encrypted.encryptedData,
          iv: encrypted.iv
        });

        await newMessage.save();
        await newMessage.populate('sender receiver', 'username email isGuest');

        const messageData = {
          _id: newMessage._id,
          sender: newMessage.sender,
          receiver: newMessage.receiver,
          message: message.trim(),
          timestamp: newMessage.timestamp,
          isRead: false,
          messageType: newMessage.messageType
        };

        // Send to receiver if online
        socket.to(receiverId).emit('newMessage', messageData);

        // Confirm to sender
        socket.emit('messageConfirmed', messageData);

        console.log(`Message sent from ${socket.user.username} to ${receiver.username}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      if (receiverId) {
        socket.to(receiverId).emit('userTyping', {
          userId: socket.userId,
          username: socket.user.username,
          isTyping: !!isTyping
        });
      }
    });

    // Handle message read status
    socket.on('markAsRead', async (data) => {
      try {
        const { messageIds } = data;
        if (Array.isArray(messageIds)) {
          await Message.updateMany(
            {
              _id: { $in: messageIds },
              receiver: socket.userId
            },
            { isRead: true }
          );
        }
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.userId})`);

      // Remove from connected users
      connectedUsers.delete(socket.userId);

      // Update user offline status
      const user = await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      }).populate('friends', '_id');

      // Notify friends
      if (user) {
        user.friends.forEach(friend => {
          socket.to(friend._id.toString()).emit('userOffline', {
            userId: socket.userId,
            username: user.username
          });
        });
      }
    });
  });

  return io;
}

function getConnectedUsers() {
  return connectedUsers;
}

export { initializeSocket, getConnectedUsers };