const express = require("express");
const router = express.Router();

// Home Route - Landing Page
router.get("/", (req, res) => {
  res.render("landing"); // No variables passed to EJS
});

// Display Registration Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle Registration Form Submission
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Save user to database (pseudo-code)
  const user = await User.create({ username, password });

  // Redirect to dashboard or login
  res.redirect("/dashboard");
});


module.exports = router;