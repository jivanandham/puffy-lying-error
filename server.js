require("dotenv").config();
const express = require("express");
const path = require("path");
const { auth } = require("express-openid-connect");
const connectDB = require("./config/database"); // Database connection
const authConfig = require("./config/authConfig"); // Auth0 configuration
const sessionConfig = require("./config/sessionConfig"); // Session configuration
const homeRoutes = require("./routes/homeRoutes"); 

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Session Management
app.use(sessionConfig);

// Auth0 Middleware
app.use(auth(authConfig));

// Routes
app.use("/", require("./routes/authRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));

app.get("/", (req, res) => {
  res.render("landing", {
    isAuthenticated: req.oidc && req.oidc.isAuthenticated(), // Use OpenID Connect middleware
    username: req.oidc && req.oidc.user ? req.oidc.user.name : null, // Pass the username if available
  });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));