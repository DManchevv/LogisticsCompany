function ensureAuthenticated(req, res, next) {
  if (req.session.user && req.session.user.name) return next();
  res.redirect('/auth/login');
};

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Недостатъчни права' });
};

function ensureAdminOrEmployee(req, res, next) {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'employee')) {
    return next();
  }
  res.status(403).json({ error: 'Недостатъчни права' });
};

function ensureBackoffice(req, res, next) {
  if (req.session.user && req.session.user.role === 'backoffice') {
    return next();
  }
  req.flash('error', 'Unauthorized access');
  res.redirect('/');
}

function ensureEmployee(req, res, next) {
  if (req.session.user && req.session.user.role === 'employee') return next();
  res.redirect('/');
};

function ensureClient(req, res, next) {
  if (req.session.user && req.session.user.role === 'client') return next();
  res.redirect('/');
};

module.exports = {
  ensureAuthenticated,
  ensureClient,
  ensureBackoffice,
	ensureAdminOrEmployee,
	ensureEmployee,
	ensureAdmin
};

