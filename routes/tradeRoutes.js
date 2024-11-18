const express = require('express');
const router = express.Router();
const { createTrade } = require('../controllers/tradeController');  // Import the createTrade function

// Route for creating a trade (buy or sell)
router.post('/trade', async (req, res) => {
  const { userId, symbol, action, quantity, price } = req.body;

  if (!userId || !symbol || !action || !quantity || !price) {
    return res.status(400).send('Missing required parameters');
  }

  try {
    const trade = await createTrade(userId, symbol, action, quantity, price);
    res.status(200).json(trade);  // Respond with the created trade details
  } catch (err) {
    console.error('Error creating trade:', err);
    res.status(500).send('Error creating trade');
  }
});

module.exports = router;