const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.get('/register', (req, res) => {
  res.render('register'); // Render registration page
});

router.post('/register', authController.registerUser); // Handle registration logic

// Login route
router.get('/login', authController.loginUser); // Render login page

module.exports = router;
