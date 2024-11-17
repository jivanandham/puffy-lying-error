const User = require('../models/userModel');

// Controller to display profile
exports.viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Find user by ID
    res.render('profile', { user }); // Pass user data to the view
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error fetching user profile' });
  }
};
