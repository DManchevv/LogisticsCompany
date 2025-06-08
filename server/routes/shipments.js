const express = require('express');
const router = express.Router();
const shipmentModel = require('../models/shipment');
const officeModel = require('../models/office');
const userModel = require('../models/user');

// List all shipments
router.get('/', async (req, res) => {
  const shipments = await shipmentModel.getAllShipments();
  res.render('backoffice/shipments/index.ejs', {
    title: 'Shipments Management',
    active: 'shipments',
    shipments,
    errors: null,
    layout: 'backoffice/layout.ejs',
  });
});


router.get('/add', async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    const offices = await officeModel.getAllOffices();
		const shipments = await shipmentModel.getAllShipments();

    res.render('backoffice/shipments/add.ejs', {
      layout: 'backoffice/layout.ejs',
      active: 'shipments',
      title: 'Add Shipment',
      formData: {},
      errors: [],
      users,
      offices,
			shipments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle add shipment form POST
router.post('/add', async (req, res) => {
  try {
		if (req.body.status === "registered" && req.body_sender_id != null && req.body_receiver_id != null && req.body_receiver_id === req.body.sender_id) {
			throw new Error('Sender and receiver cannot be the same user.');
		}

    await shipmentModel.createShipment(req.body);
    res.redirect('/bo/shipments');
  } catch (err) {
    console.error(err);

    const users = await userModel.getAllUsers();
    const offices = await officeModel.getAllOffices();
		const shipments = await shipmentModel.getAllShipments();

    // On validation error, re-render with submitted data + errors
    res.render('backoffice/shipments/add.ejs', {
      title: 'Add Shipment',
      active: 'shipments',
      layout: 'backoffice/layout.ejs',
      formData: req.body,
			users,
			offices,
			shipments,
      errors: err.errors || [],  // or your error format
    });
  }
});

router.get('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const shipment = await shipmentModel.getShipmentById(id);
  const offices = await officeModel.getAllOffices();
  const users = await userModel.getAllUsers();

  if (!shipment) {
    req.flash('error', 'Shipment not found');
    return res.redirect('/bo/shipments');
  }

  res.render('backoffice/shipments/edit.ejs', {
    title: 'Edit Shipment',
    layout: 'backoffice/layout.ejs',
    active: 'shipments',
    shipment,
    offices,
    users,
    errors: [],
    formData: shipment  // prefill form fields
  });
});

router.post('/edit/:id', async (req, res) => {
	const id = req.params.id;
	const formData = req.body;
	const offices = await officeModel.getAllOffices();
	const users = await userModel.getAllUsers();

	try {
		if (req.body.status === "registered" && req.body_sender_id != null && req.body_receiver_id != null && req.body_receiver_id === req.body.sender_id) {
			throw new Error('Sender and receiver cannot be the same user.');
		}

	  await updateShipment(id, formData);
	  res.redirect('/bo/shipments');
	} catch (err) {
		return res.render('backoffice/shipments/edit.ejs', {
			shipment: { id },
			title: 'Edit Shipment',
			active: 'shipments',
			layout: 'backoffice/layout.ejs',
			offices,
			users,
			errors: [err],
			formData
		});
	}

});

// Delete shipment
router.post('/delete/:id', async (req, res) => {
  try {
    await shipmentModel.deleteShipment(req.params.id);
    res.redirect('/bo/shipments');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting shipment');
  }
});

module.exports = router;
