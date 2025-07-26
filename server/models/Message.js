const mongoose = require('mongoose'); 
 
const messageSchema = new mongoose.Schema({ 
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  encryptedMessage: { type: String, required: true }, 
  iv: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now }, 
  isRead: { type: Boolean, default: false }, 
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' }, 
  isDeleted: { type: Boolean, default: false }, 
  editedAt: { type: Date } 
}); 
 
// Add indexes for better performance 
messageSchema.index({ sender: 1, receiver: 1 }); 
messageSchema.index({ timestamp: -1 }); 
messageSchema.index({ isRead: 1 }); 
 
module.exports = mongoose.model('Message', messageSchema); 
