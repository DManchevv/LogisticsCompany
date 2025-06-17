const express = require('express');
const router = express.Router();
const staffModel = require('../models/staff');
const officesModel = require('../models/office');
const { body, validationResult } = require('express-validator');

// ============================================================================
// GET /bo/staff - List all staff members
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const staff = await staffModel.getAllStaff();

    res.render('backoffice/staff/index.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Staff Management',
      active: 'staff',
      staff,
      success: req.flash('success'),
      errors: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load staff list');
    res.redirect('/bo/staff');
  }
});

// ============================================================================
// GET /bo/staff/add - Show the form to add a new staff member
// ============================================================================
router.get('/add', async (req, res) => {
  try {
    const offices = await officesModel.getAllOffices();

    res.render('backoffice/staff/add.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Add Staff Member',
      active: 'staff',
      offices,
      formData: req.flash('formData')[0] || {},
      errors: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load form');
    res.redirect('/bo/staff');
  }
});

// ============================================================================
// POST /bo/staff/add - Handle form submission for new staff
// ============================================================================
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

    // If validation fails, flash errors and input, then redirect
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg));
      req.flash('formData', formData);
      return res.redirect('/bo/staff/add');
    }

    try {
      await staffModel.createStaff(formData);
      req.flash('success', 'Staff member created successfully');
      res.redirect('/bo/staff');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Server error while creating staff member');
      req.flash('formData', formData);
      res.redirect('/bo/staff/add');
    }
  }
);

// ============================================================================
// GET /bo/staff/edit/:id - Show the form to edit an existing staff member
// ============================================================================
router.get('/edit/:id', async (req, res) => {
  try {
    const staff = await staffModel.getStaffById(req.params.id);

    if (!staff) {
      req.flash('error', 'Staff member not found');
      return res.redirect('/bo/staff');
    }

    const offices = await officesModel.getAllOffices();

    res.render('backoffice/staff/edit.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Edit Staff Member',
      active: 'staff',
      offices,
      formData: req.flash('formData')[0] || staff,
      errors: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load edit form');
    res.redirect('/bo/staff');
  }
});

// ============================================================================
// POST /bo/staff/edit/:id - Handle form submission to update staff info
// ============================================================================
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

    // If validation fails, flash and redirect with form data
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg));
      req.flash('formData', formData);
      return res.redirect(`/bo/staff/edit/${req.params.id}`);
    }

    try {
      const updated = await staffModel.updateStaff(req.params.id, formData);
      if (!updated) {
        req.flash('error', 'Staff member not found or could not be updated');
        return res.redirect('/bo/staff');
      }

      req.flash('success', 'Staff member updated successfully');
      res.redirect('/bo/staff');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Server error while updating staff member');
      req.flash('formData', formData);
      res.redirect(`/bo/staff/edit/${req.params.id}`);
    }
  }
);

module.exports = router;
