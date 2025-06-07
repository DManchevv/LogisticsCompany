// routes/staff.js
const express = require('express');
const router = express.Router();
const staffModel = require('../models/staff');
const { body, validationResult } = require('express-validator');

// GET /bo/staff - List all staff
router.get('/', async (req, res) => {
  try {
    const staff = await staffModel.getAllStaff();
    res.render('backoffice/staff/index.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Staff Management',
      active: 'staff',
      staff
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /bo/staff/add - Show add staff form
router.get('/add', (req, res) => {
  res.render('backoffice/staff/add.ejs', {
    layout: 'backoffice/layout.ejs',
    title: 'Add Staff Member',
    active: 'staff',
    errors: null,
    formData: {}
  });
});

// POST /bo/staff/add - Handle add staff form submission
router.post(
  '/add',
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('position').isIn(['courier', 'office']).withMessage('Invalid position'),
    body('office_id').optional({ nullable: true }).isInt().withMessage('Office ID must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    if (!errors.isEmpty()) {
      return res.render('backoffice/staff/add.ejs', {
        layout: 'backoffice/layout.ejs',
        title: 'Add Staff Member',
        active: 'staff',
        errors: errors.array(),
        formData
      });
    }

    try {
      await staffModel.createStaff(formData);
      req.flash('success', 'Staff member created successfully');
      res.redirect('/bo/staff');
    } catch (err) {
      console.error(err);
      res.render('backoffice/staff/add.ejs', {
        layout: 'backoffice/layout.ejs',
        title: 'Add Staff Member',
        active: 'staff',
        errors: [{ msg: 'Server error' }],
        formData
      });
    }
  }
);

// GET /bo/staff/edit/:id - Show edit form for staff
router.get('/edit/:id', async (req, res) => {
  try {
    const staff = await staffModel.getStaffById(req.params.id);
    if (!staff) {
      return res.status(404).send('Staff not found');
    }
    res.render('backoffice/staff/edit.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Edit Staff Member',
      active: 'staff',
      errors: null,
      formData: staff
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /bo/staff/edit/:id - Handle edit form submission
router.post(
  '/edit/:id',
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('position').isIn(['courier', 'office']).withMessage('Invalid position'),
    body('office_id').optional({ nullable: true }).isInt().withMessage('Office ID must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    if (!errors.isEmpty()) {
      return res.render('backoffice/staff/edit.ejs', {
        layout: 'backoffice/layout.ejs',
        title: 'Edit Staff Member',
        active: 'staff',
        errors: errors.array(),
        formData
      });
    }

    try {
      const updated = await staffModel.updateStaff(req.params.id, formData);
      if (!updated) {
        return res.status(404).send('Staff not found');
      }
      req.flash('success', 'Staff member updated successfully');
      res.redirect('/bo/staff');
    } catch (err) {
      console.error(err);
      res.render('backoffice/staff/edit.ejs', {
        layout: 'backoffice/layout.ejs',
        title: 'Edit Staff Member',
        active: 'staff',
        errors: [{ msg: 'Server error' }],
        formData
      });
    }
  }
);

// POST /bo/staff/delete/:id - Deactivate staff member (set active = false)
router.post('/delete/:id', async (req, res) => {
  try {
    await staffModel.deactivateStaff(req.params.id); // assume you made this method to set active = false
    req.flash('success', 'Staff member deactivated successfully');
    res.redirect('/bo/staff');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;

