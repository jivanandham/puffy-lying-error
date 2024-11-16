// Dashboard Controller

// Render User Dashboard
exports.getUserDashboard = (req, res) => {
    res.render("userDashboard", {
      title: "User Dashboard",
      message: "Welcome to the User Dashboard!",
    });
  };
  
  // Render Admin Dashboard
  exports.getAdminDashboard = (req, res) => {
    res.render("adminDashboard", {
      title: "Admin Dashboard",
      message: "Welcome to the Admin Dashboard!",
    });
  };