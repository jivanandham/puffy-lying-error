const User = require("../models/user");
const bcrypt = require("bcrypt");
const Log = require("../models/log");

// Render Landing Page
exports.getLandingPage = (req, res) => {
  res.render("landing");
};

// Render Login Page
exports.getLoginPage = (req, res) => {
  res.render("login");
};

// Render Register Page
exports.getRegisterPage = (req, res) => {
  res.render("register");
};

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("register", { error: "Passwords do not match!" });
  }

  try {
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    res.render("register", { error: "User already exists!" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render("login", { error: "Invalid credentials" });
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    // Log user activity
    const log = new Log({ user: user._id, activity: "Logged In" });
    await log.save();

    if (user.role === "admin") {
      return res.redirect("/dashboard/admin");
    }
    res.redirect("/dashboard/user");
  } catch (err) {
    res.render("login", { error: "Something went wrong" });
  }
};