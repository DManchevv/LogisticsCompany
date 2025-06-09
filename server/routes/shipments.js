const express = require('express');
const router = express.Router();  
const shipmentModel = require('../models/shipment');
const officeModel = require('../models/office');
const userModel = require('../models/user');
const { ensureAuthenticated, ensureClient, ensureBackoffice } = require('../middlewares/auth');
const { staff_pool } = require('../dbUtils');

// Helper to load shipment statuses
async function loadShipmentStatuses() {
  const res = await staff_pool.query('SELECT id, name FROM shipment_statuses ORDER BY name');
  return res.rows;
}

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

// Show Add shipment form with statuses
router.get('/add', async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    const offices = await officeModel.getAllOffices();
    const shipments = await shipmentModel.getAllShipments();
    const statuses = await loadShipmentStatuses();

    res.render('backoffice/shipments/add.ejs', {
      layout: 'backoffice/layout.ejs',
      active: 'shipments',
      title: 'Add Shipment',
      formData: {},
      errors: [],
      users,
      offices,  
      shipments,
      statuses // new
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle Add shipment POST
router.post('/add', async (req, res) => {
  try {
    if (req.body.status_id && req.body.sender_id != null && req.body.receiver_id != null && req.body.receiver_id === req.body.sender_id) {
      throw new Error('Sender and receiver cannot be the same user.');
    }

    await shipmentModel.createShipment(req.body);
    res.redirect('/bo/shipments');
  } catch (err) {
    console.error(err);

    const users = await userModel.getAllUsers();
    const offices = await officeModel.getAllOffices();
    const shipments = await shipmentModel.getAllShipments();
    const statuses = await loadShipmentStatuses();

    res.render('backoffice/shipments/add.ejs', {
      title: 'Add Shipment',
      active: 'shipments',
      layout: 'backoffice/layout.ejs',
      formData: req.body,
      users, 
      offices,
      shipments,
      statuses, // new
      errors: err.errors || [err.message],  
    });
  }
});

// Edit shipment form GET
router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const shipmentRes = await staff_pool.query('SELECT * FROM shipments WHERE id = $1', [id]);

    if (shipmentRes.rows.length === 0) {
      req.flash('error', 'Shipment not found.');
      return res.redirect('/bo/shipments');
    }
    const shipment = shipmentRes.rows[0];
    const officesRes = await staff_pool.query('SELECT id, name FROM offices ORDER BY name');
		const usersRes = await staff_pool.query(`
			SELECT id, username, first_name, last_name
			FROM users
			ORDER BY username
		`);

		const users = usersRes.rows.map(u => ({
			...u,
			displayName: `${u.username} (${u.first_name} ${u.last_name})`
		}));

    const statuses = await loadShipmentStatuses();

    let receiverUser = null;
    if (shipment.status_id && shipment.status_id !== null && shipment.receiver_id) {
      const receiverRes = await staff_pool.query('SELECT * FROM users WHERE id = $1', [shipment.receiver_id]);
      receiverUser = receiverRes.rows[0];
    }

		if (shipment.receiver_id) {
			const receiverRes = await staff_pool.query('SELECT username, first_name, last_name FROM users WHERE id = $1', [shipment.receiver_id]);
			receiverUser = receiverRes.rows[0];
			receiverUser.displayName = `${receiverUser.username} (${receiverUser.first_name} ${receiverUser.last_name})`;
		}

    res.render('backoffice/shipments/edit.ejs', {
      shipment,
      offices: officesRes.rows,
      users,
      receiverUser,
      statuses,
      errors: null,
      formData: shipment,
      layout: 'backoffice/layout.ejs',
      title: 'Edit Shipment',
      active: 'shipments'
    });

  } catch (err) {
    console.error('Error loading shipment for edit:', err);
    req.flash('error', 'Failed to load shipment.');
    res.redirect('/bo/shipments');
  }
});

// Handle Edit shipment POST
router.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const formData = req.body;
  const offices = await officeModel.getAllOffices();
  const statuses = await loadShipmentStatuses();

  try {
    if (req.body.status_id && req.body.sender_id != null && req.body.receiver_id != null && req.body.receiver_id === req.body.sender_id) {
      throw new Error('Sender and receiver cannot be the same user.');
    }

    await shipmentModel.updateShipment(id, formData);
    res.redirect('/bo/shipments');
  } catch (err) {
    let shipment = formData;
    let receiverUser = null;
    console.error(err);

    if (shipment.status_id && shipment.status_id !== null && shipment.receiver_id) {
      const receiverRes = await staff_pool.query('SELECT * FROM users WHERE id = $1', [shipment.receiver_id]);
      receiverUser = receiverRes.rows[0];
    } 

		const usersRes = await staff_pool.query(`
			SELECT id, username, first_name, last_name
			FROM users
			ORDER BY username
		`);
		const users = usersRes.rows.map(u => ({
			...u,
			displayName: `${u.username} (${u.first_name} ${u.last_name})`
		}));

		if (shipment.receiver_id) {
			const receiverRes = await staff_pool.query('SELECT username, first_name, last_name FROM users WHERE id = $1', [shipment.receiver_id]);
			receiverUser = receiverRes.rows[0];
			receiverUser.displayName = `${receiverUser.username} (${receiverUser.first_name} ${receiverUser.last_name})`;
		}

    return res.render('backoffice/shipments/edit.ejs', {
      shipment: { id },
      title: 'Edit Shipment',
      active: 'shipments',  
      layout: 'backoffice/layout.ejs',
      offices,
      receiverUser,   
      users,
      statuses, // new
      errors: [err.message || err],
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
