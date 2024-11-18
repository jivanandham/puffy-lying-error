const Trade = require('../models/Trade');  // Import the Trade model
const User = require('../models/User');    // Import the User model

// Function to create a trade
async function createTrade(userId, symbol, action, quantity, price) {
  const totalAmount = quantity * price;

  // Create a new trade
  const trade = new Trade({
    user: userId,
    symbol,
    action,
    quantity,
    price,
    totalAmount,
  });

  // Save the trade to the database
  await trade.save();

  // Update the user's trading history
  const user = await User.findById(userId);
  user.tradingHistory.push(trade._id);  // Push the trade ID into the user's trading history
  await user.save();

  return trade;  // Return the created trade
}

module.exports = { createTrade };