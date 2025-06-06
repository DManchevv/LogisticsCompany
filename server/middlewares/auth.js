exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/auth/login');
};

exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Недостатъчни права' });
};

exports.ensureAdminOrEmployee = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'employee')) {
    return next();
  }
  res.status(403).json({ error: 'Недостатъчни права' });
};

exports.ensureEmployee = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'employee') return next();
  res.redirect('/dashboard');
};

exports.ensureClient = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'client') return next();
  res.redirect('/dashboard');
};
