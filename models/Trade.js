const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User
  symbol: { type: String, required: true }, // Stock symbol, e.g., 'AAPL'
  action: { type: String, enum: ['buy', 'sell'], required: true }, // Buy or sell
  quantity: { type: Number, required: true }, // Number of shares
  price: { type: Number, required: true }, // Price per share
  totalAmount: { type: Number, required: true }, // Total value of the trade
  tradeDate: { type: Date, default: Date.now }, // Timestamp of when the trade was executed
});

module.exports = mongoose.model('Trade', tradeSchema);