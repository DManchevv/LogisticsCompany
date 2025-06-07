module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.user && req.session.user.name) return next();
  res.redirect('/auth/login');
};

module.exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Недостатъчни права' });
};

module.exports.ensureAdminOrEmployee = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'employee')) {
    return next();
  }
  res.status(403).json({ error: 'Недостатъчни права' });
};

module.exports.ensureEmployee = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'employee') return next();
  res.redirect('/');
};

module.exports.ensureClient = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'client') return next();
  res.redirect('/');
};
