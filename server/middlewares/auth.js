exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Неоторизиран достъп' });
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

exports.ensureClient = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'client') {
    return next();
  }
  res.status(403).json({ error: 'Недостатъчни права' });
};
