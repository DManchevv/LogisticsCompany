// Middleware to ensure the user is logged in
function ensureAuthenticated(req, res, next) {
  // Checks if a session exists and the user has a name
  if (req.session.user && req.session.user.name) return next();

  // Redirect to login if not authenticated
  res.redirect('/auth/login');
};

// Middleware to allow only admin users (used with Passport.js style auth)
function ensureAdmin(req, res, next) {
  // Assumes `req.isAuthenticated()` is available (e.g., via Passport.js)
  if (req.session.user && req.session.user.role === 'admin') {
    return next(); // Allow access
  }

  // Deny access with 403 if not admin
  res.status(403).json({ error: 'Unauthorized access' });
};

// Middleware to allow admins and employees
function ensureAdminOrEmployee(req, res, next) {
  // Allow if user is authenticated and is either admin or employee
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'staff')) {
    return next();
  }

  // Deny access with 403 if neither role matches
  res.status(403).json({ error: 'Unauthorized access' });
};

// Middleware to allow back office users only (based on session)
function ensureStaff(req, res, next) {
  // Check if the user session exists and has 'backoffice' role
  if (req.session.user && req.session.user.role === 'staff') {
    return next();
  }

  res.status(403).json({ error: 'Unauthorized access' });
}

// Middleware to allow only clients (based on session)
function ensureClient(req, res, next) {
  if (req.session.user && req.session.user.role === 'client') return next();

  // Redirect to home if not client
  res.redirect('/');
};

// Export all middleware functions
module.exports = {
  ensureAuthenticated,
  ensureClient,
  ensureAdminOrEmployee,
  ensureStaff,
  ensureAdmin
};

