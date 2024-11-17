const express = require('express');
const { auth } = require('express-openid-connect');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require('dotenv');  // To load environment variables
const User = require('./models/User');  // Import User model
const bcrypt = require('bcryptjs');  // For hashing passwords
const helmet = require('helmet');  // For security headers

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connecting to MongoDB: ', error));

// Auth0 Configuration
const authConfig = {
  issuerBaseURL: process.env.AUTH0_ISSUER_URL,   // Your Auth0 domain URL
  baseURL: process.env.BASE_URL || `http://localhost:${PORT}`, // Your base URL
  clientID: process.env.AUTH0_CLIENT_ID,         // Auth0 client ID
  clientSecret: process.env.AUTH0_CLIENT_SECRET, // Auth0 client secret
  secret: process.env.SESSION_SECRET,            // Secret used for session management
  authRequired: false,                          // Set to true if authentication is required for all routes
  auth0Logout: true,                            // Enables Auth0 logout
  session: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure this is true if using HTTPS
    },
  },
};

// Use helmet for setting CSP headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],  // Only allow content from same origin
    scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://cdn.jsdelivr.net"], // Allow inline scripts and Google scripts
    styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
    imgSrc: ["'self'", "data:", "https://www.google-analytics.com"],  // Allow images from self and data URIs
    connectSrc: ["'self'", "https://www.google-analytics.com"], // Allow Google Analytics
  },
}));

// Initialize Auth0 middleware
app.use(auth(authConfig));

// Middleware to manage sessions
app.use(session({
  secret: process.env.SESSION_SECRET,  // Session secret
  resave: false,
  saveUninitialized: true,
}));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set path to views folder

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies (for POST requests)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home route (if authenticated, redirect to landing page; otherwise render home page)
app.get('/', (req, res) => {
  const user = req.oidc.user || null; // Get the user from Auth0 or null if not authenticated
  if (req.oidc.isAuthenticated()) {
    return res.redirect('/landing');  // Redirect authenticated users to the landing page
  }
  res.render('index', { user }); // Render home page for non-authenticated users
});

// Login route (with custom scope)
app.get('/login', (req, res) => {
  const redirectToAuth0 = req.oidc.login({
    authorizationParams: {
      scope: 'openid profile email', // This includes id_token and user info
    }
  });
  res.redirect(redirectToAuth0); // Redirect the user to Auth0 login
});

// Logout route (handled by Auth0)
app.get('/logout', (req, res) => {
  res.oidc.logout();
  res.redirect('/'); // Redirect to home after logout
});

// Register route
app.get('/register', (req, res) => {
  res.render('register', { user: req.oidc.user || null }); // Pass user to the register page
});

// POST route for handling the registration form submission
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate the data
  if (!username || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email is already registered');  // Return error if email is duplicate
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();
    console.log('User registered:', newUser);

    // Redirect to login page after registration
    res.redirect('/login');  

  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }
});

// Callback route (after Auth0 redirects after login)
app.get('/callback', (req, res) => {
  res.redirect('/landing'); // After successful login, redirect to landing page
});

// Landing page route (only accessible if the user is authenticated)
app.get('/landing', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.render('landing', { user: req.oidc.user }); // Render landing page with user data
  } else {
    res.redirect('/login'); // Redirect to login if not authenticated
  }
});

// Error route (optional, for showing error pages)
app.get('/error', (req, res) => {
  res.render('error', { message: 'Something went wrong' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
