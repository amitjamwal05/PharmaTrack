require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const users = await User.find({ role: 'owner' }).populate('storeId').limit(5);
    users.forEach(u => {
      console.log(`Email: ${u.email}, Store: ${u.storeId ? u.storeId.name : 'None'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
