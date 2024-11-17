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

// Use Helmet for Content Security Policy (CSP)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],  // Only allow content from the same origin
    scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"], // Allow inline scripts and external sources like Google and CDNJS
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], // Allow inline styles and external styles from CDNJS
    imgSrc: ["'self'", "data:", "https://www.google-analytics.com", "https://cdn.glitch.me", "https://cdn.glitch.com"],  // Allow images from self, data URIs, and Glitch
    connectSrc: ["'self'", "https://www.google-analytics.com"], // Allow connections to Google Analytics
    fontSrc: ["'self'", "https://cdnjs.cloudflare.com"], // Allow fonts from the same origin and CDNJS
    objectSrc: ["'none'"],  // Block all plugins like Flash
    frameSrc: ["'none'"],   // Block embedding in frames
    upgradeInsecureRequests: [],  // Allow mixed content upgrade
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

// Home route (landing page)
app.get('/', (req, res) => {
  // Check if the user is authenticated
  const user = req.oidc.user || null;
  res.render('landing', { user });  // Render landing page if authenticated or not
});

// Routes for the pages
app.get('/about', (req, res) => {
  res.render('about', { user: req.oidc.user || null });  // Render the About page
});

app.get('/features', (req, res) => {
  res.render('features', { user: req.oidc.user || null }); // Pass `user`
});

app.get('/pricing', (req, res) => {
  res.render('pricing', { user: req.oidc.user || null });  // Render the Pricing page
});

app.get('/contact', (req, res) => {
  res.render('contact', { user: req.oidc.user || null });  // Render the Contact page
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

app.get('/callback', (req, res) => {
  // Check if the user has an admin role (you can also use the user’s role from Auth0 or your database)
  if (req.oidc.isAuthenticated()) {
    const user = req.oidc.user;

    // Example: Check for the 'admin' role (you can adjust based on how your roles are stored)
    if (user && user.roles && user.roles.includes('admin')) {
      return res.redirect('/admin-dashboard');  // Redirect to admin dashboard if the user is an admin
    } else {
      return res.redirect('/user-dashboard');  // Redirect to user dashboard if the user is not an admin
    }
  } else {
    res.redirect('/login');  // Redirect to login if not authenticated
  }
});


app.get('/admin-dashboard', (req, res) => {
  if (req.oidc.isAuthenticated() && req.oidc.user && req.oidc.user.roles && req.oidc.user.roles.includes('admin')) {
    res.render('admin-dashboard', { user: req.oidc.user });
  } else {
    res.redirect('/login');  // Redirect to login if not authenticated or not an admin
  }
});

app.get('/user-dashboard', (req, res) => {
  if (req.oidc.isAuthenticated() && req.oidc.user && (!req.oidc.user.roles || !req.oidc.user.roles.includes('admin'))) {
    res.render('user-dashboard', { user: req.oidc.user });
  } else {
    res.redirect('/login');  // Redirect to login if not authenticated or not a user
  }
});


// Route to display all users (only accessible by admins)
app.get('/users', async (req, res) => {
  // Ensure the user is authenticated and has the admin role
  if (req.oidc.isAuthenticated() && req.oidc.user && req.oidc.user.roles && req.oidc.user.roles.includes('admin')) {
    try {
      // Fetch all users from the database (you can customize this query as needed)
      const users = await User.find();

      // Render the users page with the list of users
      res.render('users', { users });
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
    }
  } else {
    // Redirect to login if not authenticated or not an admin
    res.redirect('/login');
  }
});


// Route to edit user details (admin only)
app.get('/edit-user/:id', async (req, res) => {
  if (req.oidc.isAuthenticated() && req.oidc.user && req.oidc.user.roles.includes('admin')) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.render('edit-user', { user });
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Error fetching user');
    }
  } else {
    res.redirect('/login');
  }
});


// Route to delete a user (admin only)
app.get('/delete-user/:id', async (req, res) => {
  if (req.oidc.isAuthenticated() && req.oidc.user && req.oidc.user.roles.includes('admin')) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.redirect('/users'); // Redirect to the users page after deletion
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Error deleting user');
    }
  } else {
    res.redirect('/login');
  }
});

// Route to change the user's role to 'admin' (only accessible by admins)
app.get('/change-role/:id', async (req, res) => {
  if (req.oidc.isAuthenticated() && req.oidc.user && req.oidc.user.roles.includes('admin')) {
    try {
      const userId = req.params.id;

      // Find the user by their ID
      const user = await User.findById(userId);

      // If the user doesn't exist, return a 404 error
      if (!user) {
        return res.status(404).send('User not found');
      }

      // Add the 'admin' role to the user (if not already assigned)
      if (!user.roles.includes('admin')) {
        user.roles.push('admin'); // Add 'admin' role to the user's roles array
        await user.save();
        res.send('User role updated to admin');
      } else {
        res.send('User is already an admin');
      }

    } catch (err) {
      console.error('Error changing user role:', err);
      res.status(500).send('Error changing user role');
    }
  } else {
    res.redirect('/login'); // Redirect to login if not authenticated or not an admin
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
