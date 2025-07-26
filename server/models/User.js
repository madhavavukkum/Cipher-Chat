import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isGuest: { type: Boolean, default: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  }],
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 }
}, { timestamps: true });

// Add indexes for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1 });

export default mongoose.model('User', userSchema);