const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');

// Admin dashboard route
router.get('/', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.user,
        currentPage: 'dashboard'
    });
});

// User management route
router.get('/users', ensureAuthenticated, ensureAdmin, (req, res) => {
    // In a real app, you would fetch users from your database
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
    ];
    
    res.render('admin/users', {
        title: 'Manage Users',
        users,
        currentPage: 'users'
    });
});

// Content management route
router.get('/content', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('admin/content', {
        title: 'Manage Content',
        currentPage: 'content'
    });
});

// Settings route
router.get('/settings', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('admin/settings', {
        title: 'Admin Settings',
        currentPage: 'settings'
    });
});

module.exports = router;
