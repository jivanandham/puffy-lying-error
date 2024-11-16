require("dotenv").config();

const authConfig = {
  authRequired: false, // Auth not required for every route
  auth0Logout: true,   // Use Auth0 logout
  secret: process.env.AUTH0_SECRET, // Secret for signing cookies
  baseURL: process.env.BASE_URL,    // Base URL of the app
  clientID: process.env.AUTH0_CLIENT_ID, // Auth0 Client ID
  issuerBaseURL: process.env.AUTH0_DOMAIN, // Auth0 domain
};

module.exports = authConfig;