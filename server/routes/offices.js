const express = require('express');
const router = express.Router();
const officeModel = require('../models/office');
const { body, validationResult } = require('express-validator');

/**
 * GET /bo/offices
 * Render the office list view.
 */
router.get('/', async (req, res) => {
  try {
    const offices = await officeModel.getAllOffices();
    res.render('backoffice/offices/index.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Office Management',
      active: 'offices',
      offices,
      success: req.flash('success'),
      errors: req.flash('errors') // errors from flash
    });
  } catch (err) {
    console.error('Failed to fetch offices:', err);
    req.flash('errors', 'Failed to load office list');
    res.redirect('/bo');
  }
});

/**
 * GET /bo/offices/add
 * Render form to add a new office.
 */
router.get('/add', async (req, res) => {
  try {
    const offices = await officeModel.getAllOffices(); // Optional: for context/reference
    res.render('backoffice/offices/add.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Add Office',
      active: 'offices',
      offices,
      formData: {},
      success: req.flash('success'),
      errors: req.flash('errors')
    });
  } catch (err) {
    console.error('Failed to load add office form:', err);
    req.flash('errors', 'Unable to load add office page');
    res.redirect('/bo/offices');
  }
});

/**
 * POST /bo/offices/add
 * Handle submission of new office form.
 */
router.post(
  '/add',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    // Validation error
    if (!errors.isEmpty()) {
      // Save validation errors in flash and redirect to show them
      req.flash('errors', errors.array().map(e => e.msg));
      req.flash('formData', formData);
      return res.redirect('/bo/offices/add');
    }

    try {
      await officeModel.createOffice(formData);
      req.flash('success', 'Office created successfully');
      res.redirect('/bo/offices');
    } catch (err) {
      console.error('Error creating office:', err);
      req.flash('errors', 'Failed to create office');
      req.flash('formData', formData);
      res.redirect('/bo/offices/add');
    }
  }
);

/**
 * GET /bo/offices/edit/:id
 * Render form to edit a specific office.
 */
router.get('/edit/:id', async (req, res) => {
  try {
    const office = await officeModel.getOfficeById(req.params.id);
    if (!office) {
      req.flash('errors', 'Office not found');
      return res.redirect('/bo/offices');
    }

    // Pull saved formData from flash if present (on validation error redirect)
    const flashFormData = req.flash('formData')[0];
    res.render('backoffice/offices/edit.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Edit Office',
      active: 'offices',
      formData: flashFormData || office,
      success: req.flash('success'),
      errors: req.flash('errors')
    });
  } catch (err) {
    console.error('Failed to load office for editing:', err);
    req.flash('errors', 'Unable to load edit form');
    res.redirect('/bo/offices');
  }
});

/**
 * POST /bo/offices/edit/:id
 * Handle submission of edit office form.
 */
router.post(
  '/edit/:id',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    if (!errors.isEmpty()) {
      // Save validation errors and form data in flash, then redirect
      req.flash('errors', errors.array().map(e => e.msg));
      req.flash('formData', formData);
      return res.redirect(`/bo/offices/edit/${req.params.id}`);
    }

    try {
      const updated = await officeModel.updateOffice(req.params.id, formData);
      if (!updated) {
        req.flash('errors', 'Office not found');
        return res.redirect('/bo/offices');
      }

      req.flash('success', 'Office updated successfully');
      res.redirect('/bo/offices');
    } catch (err) {
      console.error('Failed to update office:', err);
      req.flash('errors', 'Failed to update office');
      req.flash('formData', formData);
      res.redirect(`/bo/offices/edit/${req.params.id}`);
    }
  }
);

/**
 * POST /bo/offices/delete/:id
 * Deactivate an office (soft delete).
 */
router.post('/delete/:id', async (req, res) => {
  try {
    const deactivated = await officeModel.deactivateOffice(req.params.id);
    if (!deactivated) {
      req.flash('errors', 'Office not found or could not be deactivated');
    } else {
      req.flash('success', 'Office deactivated successfully');
    }
  } catch (err) {
    console.error('Failed to deactivate office:', err);
    req.flash('errors', 'Server error while deactivating office');
  }

  res.redirect('/bo/offices');
});

module.exports = router;

