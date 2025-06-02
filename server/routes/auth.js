const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// GET /register
router.get('/register', (req, res) => {
    res.render('register.ejs', { 
        title: 'Register',
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg'),
        currentPage: 'register',
        user: req.user,
    });
});

// GET /login
router.get('/login', (req, res) => {
    res.render('login.ejs', { 
        title: 'Login',
        currentPage: 'login',
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg'),
        user: req.user,
    });
});

// GET /admin-login
router.get('/admin-login', (req, res) => {
    res.render('admin-login.ejs', { 
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
