const express = require("express");
const Alpaca = require("@alpacahq/alpaca-trade-api");
const router = express.Router();

// Set up Alpaca API client
const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY,  // Replace with your API key
  secretKey: process.env.ALPACA_API_SECRET,  // Replace with your secret key
  paper: true,  // Use the paper trading environment for testing
});

// Endpoint to get live stock data
router.get("/stockdata/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const bars = await alpaca.getBars('day', symbol, { limit: 100 }).catch((error) => {
      console.error("Error fetching stock data:", error);
      res.status(500).send("Error fetching stock data");
    });
    const stockData = bars[symbol].map(bar => ({
      time: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));
    res.json(stockData);
  } catch (err) {
    res.status(500).send("Error fetching stock data");
  }
});

module.exports = router;