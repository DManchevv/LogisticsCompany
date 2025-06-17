const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const officesModel = require('../models/office');

// GET /bo/users - Display the list of all users
router.get('/', async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.render('backoffice/users/index.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'User Management',
      active: 'users',
      user: users,
      success: req.flash('success'),
      errors: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load users');
    res.redirect('/bo/users');
  }
});

// GET /bo/users/add - Display the form to add a new user
router.get('/add', async (req, res) => {
  try {
    const offices = await officesModel.getAllOffices();
    res.render('backoffice/users/add.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Add New User',
      active: 'users',
      success: req.flash('success'),
      errors: req.flash('error'),
      formData: req.flash('formData')[0] || {},
      offices
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load add user form');
    res.redirect('/bo/users');
  }
});

// POST /bo/users/add - Handle submission of new user form
router.post('/add', async (req, res) => {
  const { username, password, first_name, last_name, email, phone, address, active } = req.body;
  const errors = [];

  if (!username) errors.push('Username is required');
  if (!password) errors.push('Password is required');
  if (!first_name) errors.push('First name is required');
  if (!last_name) errors.push('Last name is required');
  if (!email) errors.push('Email is required');

  if (errors.length > 0) {
    req.flash('error', errors);
    req.flash('formData', req.body);
    return res.redirect('/bo/users/add');
  }

  try {
    await userModel.createUser({ username, password, first_name, last_name, email, phone, address, active });
    req.flash('success', 'User created successfully');
    res.redirect('/bo/users');
  } catch (err) {
    console.error('Add user error:', err);

    let errorMessage = 'Error adding user';
    if (err.code === '23505') {
      if (err.constraint === 'users_username_key') {
        errorMessage = 'Username already exists';
      } else if (err.constraint === 'users_email_key') {
        errorMessage = 'Email already exists';
      }
    }

    req.flash('error', errorMessage);
    req.flash('formData', req.body);
    res.redirect('/bo/users/add');
  }
});

// GET /bo/users/edit/:id - Display the form to edit an existing user
router.get('/edit/:id', async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/bo/users');
    }

    const offices = await officesModel.getAllOffices();

    res.render('backoffice/users/edit.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Edit User',
      active: 'users',
      success: req.flash('success'),
      errors: req.flash('error'),
      formData: req.flash('formData')[0] || user,
      offices
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading edit form');
    res.redirect('/bo/users');
  }
});

// POST /bo/users/edit/:id - Handle form submission to update user details
router.post('/edit/:id', async (req, res) => {
  const { username, first_name, last_name, email, phone, address, active } = req.body;
  const errors = [];

  if (!username) errors.push('Username is required');
  if (!first_name) errors.push('First name is required');
  if (!last_name) errors.push('Last name is required');
  if (!email) errors.push('Email is required');

  if (errors.length > 0) {
    req.flash('error', errors);
    req.flash('formData', { ...req.body, id: req.params.id });
    return res.redirect(`/bo/users/edit/${req.params.id}`);
  }

  try {
    await userModel.updateUser(req.params.id, {
      username,
      first_name,
      last_name,
      email,
      phone,
      address,
      active
    });

    req.flash('success', 'User updated successfully');
    res.redirect('/bo/users');
  } catch (err) {
    console.error('Edit user error:', err);

    let errorMessage = 'Error updating user';
    if (err.code === '23505') {
      if (err.constraint === 'users_username_key') {
        errorMessage = 'Username already exists';
      } else if (err.constraint === 'users_email_key') {
        errorMessage = 'Email already exists';
      }
    }

    req.flash('error', errorMessage);
    req.flash('formData', { ...req.body, id: req.params.id });
    res.redirect(`/bo/users/edit/${req.params.id}`);
  }
});

// POST /bo/users/delete/:id - Deactivate user (soft delete)
router.post('/delete/:id', async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    req.flash('success', 'User deactivated successfully');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to deactivate user');
  }
  res.redirect('/bo/users');
});

module.exports = router;

