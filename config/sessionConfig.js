const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const sessionConfig = session({
  secret: process.env.SESSION_SECRET, // Use a strong secret from .env
  resave: false,                     // Don't save session if unmodified
  saveUninitialized: false,          // Don't create session until something is stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // Connection string to MongoDB
    collectionName: "sessions",      // Name of the collection in MongoDB
    ttl: 14 * 24 * 60 * 60,          // Session time-to-live (14 days)
  }),
});

module.exports = sessionConfig;