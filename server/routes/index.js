const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('home.ejs', { 
        title: 'Home',
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg'),
        error: req.flash('error'),
				layout: ''
    });
});

// About route
router.get('/about', (req, res) => {
    res.render('about.ejs', { title: 'About Us' });
});

// Add other routes as needed

module.exports = router;
