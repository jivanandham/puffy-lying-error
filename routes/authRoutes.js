const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", authController.getLandingPage);
router.get("/login", authController.getLoginPage);
router.get("/register", authController.getRegisterPage);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

module.exports = router;