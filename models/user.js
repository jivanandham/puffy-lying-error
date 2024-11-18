const mongoose = require('mongoose');
const Trade = require('../models/Trade');

const userSchema = new mongoose.Schema({
  // Basic User Info
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Trading-related Fields
  tradingBalance: { type: Number, default: 0 },  // Balance in the trading account
  accountType: { type: String, enum: ['individual', 'joint', 'corporate'], default: 'individual' }, // Account type (individual, joint, etc.)
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }, // Account status
  role: { type: String, enum: ['user', 'admin', 'trader', 'broker'], default: 'user' },  // User role (admin, trader, etc.)

  // Timestamps
  createdAt: { type: Date, default: Date.now },  // When the account was created
  lastLogin: { type: Date },  // Last login timestamp

  // Additional Fields Related to Trading
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, // Risk level (low, medium, high)
  marginAccount: { type: Boolean, default: false }, // Whether the user has a margin account
  availableCredit: { type: Number, default: 0 },  // Available credit for margin trading
  totalInvested: { type: Number, default: 0 }, // Total amount invested by the user
  tradingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',  // Reference to a Trade model that you can define for each trade made
  }]
});

// Update last login timestamp on each login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Create the User model
module.exports = mongoose.model('User', userSchema);