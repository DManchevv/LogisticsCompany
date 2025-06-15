const express = require('express');
const router = express.Router();
const userModel = require('../models/user');

// GET /bo/users - List all users (clients)
router.get('/', async (req, res) => {
  try {
    const user = await userModel.getAllUsers();

    res.render('backoffice/users/index.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'User Management',
      active: 'users',
      user: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.get('/add', async (req, res) => {
  try {
    res.render('backoffice/users/add.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Add New User',
      active: 'users',
      errors: null,
      formData: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
