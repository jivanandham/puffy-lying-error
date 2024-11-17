const User = require('../models/userModel'); // Import User model
const bcrypt = require('bcrypt');

// Controller to handle user registration
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Redirect to login page after registration
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error in registration process' });
  }
};

// Controller to handle login
exports.loginUser = (req, res) => {
  res.render('login'); // Render login page
};
