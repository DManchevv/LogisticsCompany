const express = require('express');
const router = express.Router();

const shipmentModel = require('../models/shipment');
const officeModel = require('../models/office');
const userModel = require('../models/user');
const { staff_pool } = require('../dbUtils');

/**
 * Helper function to load all shipment statuses from DB.
 * @returns {Promise<Array>} Array of shipment statuses.
 */
async function loadShipmentStatuses() {
  const res = await staff_pool.query('SELECT id, name FROM shipment_statuses ORDER BY name');
  return res.rows;
}

// ============================================================================
//  GET /bo/shipments
//  List all shipments with management UI.
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const shipments = await shipmentModel.getAllShipments();

    res.render('backoffice/shipments/index.ejs', {
      title: 'Shipments Management',
      active: 'shipments',
      shipments,
      errors: req.flash('errors'),
      success: req.flash('success'),
      layout: 'backoffice/layout.ejs',
    });
  } catch (err) {
    console.error('Failed to fetch shipments:', err);
    req.flash('errors', 'Unable to load shipments list. Please try again later.');
    res.redirect('/bo');
  }
});

// ============================================================================
// GET /bo/shipments/add
// Render form to add a new shipment, loading all required reference data.
// ============================================================================

router.get('/add', async (req, res) => {
  try {
    const [users, offices, shipments, statuses] = await Promise.all([
      userModel.getAllUsers(),
      officeModel.getAllOffices(),
      shipmentModel.getAllShipments(),
      loadShipmentStatuses()
    ]);

    // Render form with any flashed errors or form data (if redirected after validation failure)
    res.render('backoffice/shipments/add.ejs', {
      layout: 'backoffice/layout.ejs',
      active: 'shipments',
      title: 'Add Shipment',
      formData: req.flash('formData')[0] || {},
      success: req.flash('success'),
      errors: req.flash('errors'),
      users,
      offices,
      shipments,
      statuses
    });
  } catch (err) {
    console.error('Failed to load add shipment form:', err);
    req.flash('errors', 'Unable to load the Add Shipment page. Please try again later.');
    res.redirect('/bo/shipments');
  }
});

// ============================================================================
// POST /bo/shipments/add
// Handle adding a new shipment. Validates inputs and shows errors via flash.
// ============================================================================
router.post('/add', async (req, res) => {
  try {
    const { status_id, sender_id, receiver_id } = req.body;

    // Business validation: sender and receiver cannot be the same user
    if (sender_id && receiver_id && sender_id === receiver_id) {
      throw new Error('Sender and receiver cannot be the same user.');
    }

    // Create shipment in DB
    await shipmentModel.createShipment(req.body);

    req.flash('success', 'Shipment created successfully.');
    res.redirect('/bo/shipments');
  } catch (err) {
    console.error('Error creating shipment:', err);

    // Save form data and error messages in flash for rendering after redirect
    req.flash('errors', [err.message || 'Failed to create shipment. Please check your input.']);
    req.flash('formData', req.body);

    res.redirect('/bo/shipments/add');
  }
});

// ============================================================================
//  GET /bo/shipments/edit/:id
// Render edit form for a specific shipment by ID.
// ============================================================================

router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch shipment from DB
    const shipmentRes = await staff_pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
    if (shipmentRes.rows.length === 0) {
      req.flash('errors', 'Shipment not found.');
      return res.redirect('/bo/shipments');
    }
    const shipment = shipmentRes.rows[0];

    // Load offices, users and shipment statuses in parallel
    const [officesRes, usersRes, statuses] = await Promise.all([
      staff_pool.query('SELECT id, name FROM offices ORDER BY name'),
      staff_pool.query('SELECT id, username, first_name, last_name FROM users ORDER BY username'),
      loadShipmentStatuses()
    ]);

    // Format users with display names
    const users = usersRes.rows.map(u => ({
      ...u,
      displayName: `${u.username} (${u.first_name} ${u.last_name})`
    }));

    // Determine receiver user display info, if any
    let receiverUser = null;
    if (shipment.receiver_id) {
      const receiverRes = await staff_pool.query('SELECT username, first_name, last_name FROM users WHERE id = $1', [shipment.receiver_id]);
      if (receiverRes.rows.length > 0) {
        const ru = receiverRes.rows[0];
        receiverUser = { ...ru, displayName: `${ru.username} (${ru.first_name} ${ru.last_name})` };
      }
    }

    // Use flashed formData if present (from failed validation redirect)
    const formData = req.flash('formData')[0] || shipment;

    res.render('backoffice/shipments/edit.ejs', {
      shipment,
      offices: officesRes.rows,
      users,
      receiverUser,
      statuses,
      errors: req.flash('errors'),
      success: req.flash('success'),
      formData,
      layout: 'backoffice/layout.ejs',
      title: 'Edit Shipment',
      active: 'shipments'
    });
  } catch (err) {
    console.error('Error loading shipment for edit:', err);
    req.flash('errors', 'Failed to load shipment details. Please try again.');
    res.redirect('/bo/shipments');
  }
});

// ============================================================================
// POST /bo/shipments/edit/:id
// Handle updating a shipment. Validates inputs and shows errors via flash.
// ============================================================================

router.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const formData = req.body;

  try {
    const { status_id, sender_id, receiver_id } = formData;

    // Business validation: sender and receiver cannot be the same user
    if (sender_id && receiver_id && sender_id === receiver_id) {
      throw new Error('Sender and receiver cannot be the same user.');
    }

    // Update shipment in DB
    const updated = await shipmentModel.updateShipment(id, formData);
    if (!updated) {
      req.flash('errors', 'Shipment not found or could not be updated.');
      return res.redirect('/bo/shipments');
    }

    req.flash('success', 'Shipment updated successfully.');
    res.redirect('/bo/shipments');
  } catch (err) {
    console.error('Failed to update shipment:', err);

    // Save error message and formData for re-render after redirect
    req.flash('errors', [err.message || 'Failed to update shipment. Please check your input.']);
    req.flash('formData', formData);

    res.redirect(`/bo/shipments/edit/${id}`);
  }
});

// ============================================================================
// POST /bo/shipments/delete/:id
// Delete a shipment by ID.
// ============================================================================

router.post('/delete/:id', async (req, res) => {
  try {
    await shipmentModel.deleteShipment(req.params.id);
    req.flash('success', 'Shipment deleted successfully.');
  } catch (err) {
    console.error('Error deleting shipment:', err);
    req.flash('errors', 'Failed to delete shipment. Please try again later.');
  }

  res.redirect('/bo/shipments');
});

module.exports = router;

