const express = require('express');
const router = express.Router();
const officeModel = require('../models/office');
const shipmentModel = require('../models/shipment');
const { body, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
  const offices = await officeModel.getAllOffices();
  res.render('backoffice/offices/index.ejs', {
    layout: 'backoffice/layout.ejs',
    title: 'Office Management',
    active: 'offices',
    offices
  });
});

router.get('/add', async (req, res) => {
  try {
    const offices = await officeModel.getAllOffices();
	console.log("OFFICES:", offices);
    res.render('backoffice/offices/add.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Add Office',
      active: 'offices',
      offices,
      formData: {},
      errors: []
    });
  } catch (err) {
    console.error('Failed to load shipment form:', err);
    res.status(500).send('Internal server error');
  }
});

router.post('/add', [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
], async (req, res) => {
  const errors = validationResult(req);
  const formData = req.body;

  if (!errors.isEmpty()) {
    return res.render('backoffice/offices/add.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Add Office',
      active: 'offices',
      errors: errors.array(),
      formData
    });
  }

  await officeModel.createOffice(formData);
  res.redirect('/bo/offices');
});

router.get('/edit/:id', async (req, res) => {
  const office = await officeModel.getOfficeById(req.params.id);
  if (!office) return res.status(404).send('Office not found');

  res.render('backoffice/offices/edit.ejs', {
    layout: 'backoffice/layout.ejs',
    title: 'Edit Office',
    active: 'offices',
    errors: [],
    formData: office
  });
});

router.post('/edit/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
], async (req, res) => {
  const errors = validationResult(req);
  const formData = req.body;

  if (!errors.isEmpty()) {
    return res.render('backoffice/offices/edit.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Edit Office',
      active: 'offices',
      errors: errors.array(),
      formData
    });
  }

  await officeModel.updateOffice(req.params.id, formData);
  res.redirect('/bo/offices');
});

router.post('/delete/:id', async (req, res) => {
  await officeModel.deactivateOffice(req.params.id);
  res.redirect('/bo/offices');
});

module.exports = router;
