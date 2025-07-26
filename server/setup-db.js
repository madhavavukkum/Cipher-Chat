const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); 
const User = require('./models/User'); 
require('dotenv').config(); 
 
async function setupDatabase() { 
  try { 
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log('Connected to MongoDB'); 
 
    // Create indexes 
    await User.createIndexes(); 
    console.log('Database indexes created'); 
 
    // Create a demo admin user (optional) 
    const adminExists = await User.findOne({ email: 'admin@chat.com' }); 
    if (!adminExists) { 
      const adminUser = new User({ 
        username: 'admin', 
        email: 'admin@chat.com', 
        password: await bcrypt.hash('admin123', 12), 
        bio: 'System Administrator' 
      }); 
      await adminUser.save(); 
      console.log('Demo admin user created (admin@chat.com / admin123)'); 
    } 
 
    console.log('Database setup completed successfully'); 
  } catch (error) { 
    console.error('Database setup error:', error); 
  } finally { 
    await mongoose.connection.close(); 
    process.exit(0); 
  } 
} 
 
setupDatabase(); 
