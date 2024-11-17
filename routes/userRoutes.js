const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// View Profile route
router.get('/profile/:id', userController.viewProfile); // Display user profile

module.exports = router;
