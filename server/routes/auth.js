const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login.ejs', {
    title: 'Login',
    error: req.flash('error'),
    pageName: 'login',
    user: req.user
  });
});

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register.ejs', {
    title: 'Register',
    error: req.flash('error'),
    pageName: 'register',
    user: req.user
  });
});

// GET /auth/logout
router.get('/logout', authController.logout);

// GET /admin-login
router.get('/admin-login', (req, res) => {
  res.render('auth/admin-login.ejs', {
    title: 'Admin Login',
    currentPage: 'admin-login',
    user: req.user,
    error_msg: req.flash('error_msg')
  });
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
