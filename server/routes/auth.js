const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login.ejs', { 
    title: 'Login',
    error: req.flash('error'),
    currentPage: 'login'
  });
});

// POST /auth/login
router.post('/login', (req, res) => {
  // Your login authentication logic here
  // Example:
  // if (validCredentials) {
  //   res.redirect('/dashboard');
  // } else {
  //   req.flash('error', 'Invalid credentials');
  //   res.redirect('/auth/login');
  // }
});

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register.ejs', { 
    title: 'Register',
    error: req.flash('error'),
    currentPage: 'register'
  });
});

// POST /auth/register
router.post('/register', (req, res) => {
  // Your registration logic here
  // Example:
  // if (passwordsMatch) {
  //   createUser(req.body);
  //   res.redirect('/dashboard');
  // } else {
  //   req.flash('error', 'Passwords do not match');
  //   res.redirect('/auth/register');
  // }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  // Your logout logic here
  req.logout();
  res.redirect('/');
});

// GET /admin-login
router.get('/admin-login', (req, res) => {
    res.render('auth/admin-login.ejs', { 
        title: 'Admin Login',
        currentPage: 'admin-login',
        user: req.user,
        error_msg: req.flash('error_msg')
    });
});


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
