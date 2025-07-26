# MERN Stack E2E Encrypted Chat Application 
 
## 🚀 Features 
 
### Core Features 
- **User Authentication**: Register, login, and secure session management 
- **Guest Login**: Temporary accounts with automatic data deletion on logout 
- **Profile Management**: Update username and bio in profile page 
- **Friend System**: Send, accept, and manage friend requests 
- **Real-time Messaging**: Instant messaging with Socket.IO 
- **End-to-End Encryption**: All messages encrypted using AES-256-CBC 
- **User Search**: Search users by username with smart filtering 
- **Online Status**: Real-time online/offline status indicators 
- **Typing Indicators**: See when friends are typing 
- **Message Management**: Delete messages, mark as read/unread 
- **Sidebar Chat List**: View all users except yourself 
- **Responsive Design**: Works on desktop and mobile devices 
 
### Security Features 
- **Password Hashing**: bcrypt with 12-round salt 
- **JWT Authentication**: Secure token-based authentication 
- **AES Encryption**: 256-bit encryption for all messages 
- **Input Validation**: Comprehensive server-side validation 
- **CORS Protection**: Configurable cross-origin resource sharing 
- **Guest Data Isolation**: Complete data deletion for guest users 
 
## 📁 Project Structure 
``` 
mern-e2e-chat/ 
├── models/           # MongoDB schemas 
│   ├── User.js       # User model 
│   └── Message.js    # Message model 
├── routes/           # API routes 
│   ├── auth.js       # Authentication routes 
│   ├── users.js      # User management routes 
│   ├── friends.js    # Friend system routes 
│   └── messages.js   # Message routes 
├── middleware/       # Custom middleware 
│   └── auth.js       # Authentication middleware 
├── utils/            # Utility functions 
│   ├── encryption.js # AES encryption utilities 
│   └── socket.js     # Socket.IO configuration 
├── server.js         # Main server file 
├── setup-db.js       # Database setup script 
├── package.json      # Dependencies and scripts 
└── .env              # Environment variables 
``` 
 
## 🛠️ Installation 
 
### Prerequisites 
- Node.js (v14 or higher) 
- MongoDB (v4.4 or higher) 
- npm or yarn 
 
### Quick Start 
1. **Run the setup script**: 
   ```bash 
   install.bat 
   ``` 
 
2. **Start development server**: 
   ```bash 
   start-dev.bat 
   ``` 
 
3. **Access the API**: 
   - Base URL: `http://localhost:5000/api` 
   - Health Check: `http://localhost:5000/api/health` 
 
### Manual Installation 
```bash 
# Install dependencies 
npm install 
 
# Setup database 
node setup-db.js 
 
# Start development server 
npm run dev 
 
# Or start production server 
npm start 
``` 
 
## 🔧 Configuration 
 
### Environment Variables (.env) 
```env 
PORT=5000 
MONGODB_URI=mongodb://localhost:27017/e2e-chat 
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production 
AES_SECRET=your-32-character-aes-secret-key! 
NODE_ENV=development 
``` 
 
### Security Notes 
- Change `JWT_SECRET` to a long, random string in production 
- Change `AES_SECRET` to a 32-character random string in production 
- Use a proper MongoDB connection string for production 
- Enable MongoDB authentication in production 
 
## 📚 API Documentation 
 
### Authentication Endpoints 
- `POST /api/auth/register` - User registration 
- `POST /api/auth/login` - User login 
- `POST /api/auth/guest-login` - Guest login 
- `POST /api/auth/logout` - Logout (deletes guest data) 
- `GET /api/auth/me` - Get current user info 
 
### User Management 
- `PUT /api/users/profile` - Update username and bio 
- `GET /api/users` - Get all users (paginated) 
- `GET /api/users/search?q=query` - Search users 
 
### Friend System 
- `POST /api/friends/request` - Send friend request 
- `GET /api/friends/requests` - Get pending friend requests 
- `POST /api/friends/request/respond` - Accept/reject friend request 
- `GET /api/friends` - Get friends list 
- `DELETE /api/friends/:friendId` - Remove friend 
 
### Messaging 
- `GET /api/messages/:userId` - Get messages with specific user 
- `GET /api/messages/unread/:userId` - Get unread message count 
- `DELETE /api/messages/:messageId` - Delete message 
 
### Socket.IO Events 
```javascript 
// Client Events 
socket.emit('sendMessage', { receiverId, message }); 
socket.emit('typing', { receiverId, isTyping }); 
socket.emit('markAsRead', { messageIds }); 
 
// Server Events 
socket.on('newMessage', messageData); 
socket.on('messageConfirmed', messageData); 
socket.on('messageError', errorData); 
socket.on('userTyping', typingData); 
socket.on('userOnline', userData); 
socket.on('userOffline', userData); 
``` 
 
## 🔐 Authentication 
 
### Registration 
```javascript 
POST /api/auth/register 
{ 
  "username": "john_doe", 
  "email": "john@example.com", 
  "password": "securepassword123" 
} 
``` 
 
### Login 
```javascript 
POST /api/auth/login 
{ 
  "email": "john@example.com", 
  "password": "securepassword123" 
} 
``` 
 
### Guest Login 
```javascript 
POST /api/auth/guest-login 
{ 
  "username": "guest_user" 
} 
``` 
 
## 🎯 Usage Examples 
 
### Socket.IO Client Connection 
```javascript 
import io from 'socket.io-client'; 
 
const socket = io('http://localhost:5000', { 
  auth: { 
    token: 'your-jwt-token-here' 
  } 
}); 
 
// Send a message 
socket.emit('sendMessage', { 
  receiverId: 'user-id-here', 
  message: 'Hello, world!' 
}); 
 
// Listen for new messages 
socket.on('newMessage', (messageData) =
  console.log('New message:', messageData); 
}); 
``` 
 
## 🐛 Troubleshooting 
 
### Common Issues 
 
1. **MongoDB Connection Error** 
   - Ensure MongoDB is running 
   - Check connection string in .env 
   - Verify database permissions 
 
2. **Port Already in Use** 
   - Change PORT in .env file 
   - Kill existing processes on port 5000 
 
3. **Socket.IO Connection Issues** 
   - Check CORS configuration 
   - Verify JWT token is valid 
   - Ensure user exists in database 
 
4. **Message Encryption Errors** 
   - Verify AES_SECRET is 32 characters 
   - Check encryption key consistency 
 
## 🔧 Development 
 
### Available Scripts 
- `npm start` - Start production server 
- `npm run dev` - Start development server with nodemon 
- `node setup-db.js` - Initialize database 
 
### Testing 
- Use Postman or similar tool to test API endpoints 
- Use Socket.IO client to test real-time features 
- Check `/api/health` endpoint for server status 
 
## 📄 License 
This project is licensed under the MIT License. 
 
## 🤝 Contributing 
1. Fork the repository 
2. Create a feature branch 
3. Commit your changes 
4. Push to the branch 
5. Open a Pull Request 
 
--- 
 
**Created with ❤️ using MERN Stack + Socket.IO + AES Encryption** 
 
## 🚀 Quick Commands 
 
```bash 
# Complete setup (run this first) 
install.bat 
 
# Start development server 
start-dev.bat 
 
# Start production server 
start-prod.bat 
``` 
 
🎉 **Your MERN E2E Chat application is ready!** 
