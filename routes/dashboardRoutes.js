const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Middleware for Authentication
function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

// User Dashboard Route
router.get("/user", isAuthenticated, dashboardController.getUserDashboard);

// Admin Dashboard Route
router.get("/admin", isAuthenticated, dashboardController.getAdminDashboard);

module.exports = router;