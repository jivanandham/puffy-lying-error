const mongoose = require('mongoose');

// Create the user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, you should hash the password
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
