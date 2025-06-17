const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET /auth/login - render login page with any flash messages
router.get('/login', (req, res) => {
  res.render('auth/login.ejs', {
    title: 'Login',
    errors: req.flash('error'),    // array of errors
    success: req.flash('success'), // array of success messages
    pageName: 'login',
  });
});

// GET /auth/register - render registration page with any flash messages
router.get('/register', (req, res) => {
  res.render('auth/register.ejs', {
    title: 'Register',
    errors: req.flash('error'),
    success: req.flash('success'),
    pageName: 'register',
  });
});

// GET /auth/logout - perform logout
router.get('/logout', authController.logout);

// GET /admin-login - render admin login page with flash messages
router.get('/admin-login', (req, res) => {
  res.render('auth/admin-login.ejs', {
    title: 'Admin Login',
    errors: req.flash('error'),
    success: req.flash('success'),
    currentPage: 'admin-login',
  });
});

// POST /auth/register - handle registration submission
router.post('/register', authController.register);

// POST /auth/login - handle login submission
router.post('/login', authController.login);

module.exports = router;
