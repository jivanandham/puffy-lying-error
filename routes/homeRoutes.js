const express = require("express");
const router = express.Router();

// Home Route - Landing Page
router.get("/", (req, res) => {
  res.render("landing"); // No variables passed to EJS
});

module.exports = router;