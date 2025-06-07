const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/auth');
const { ensureAuthenticated, ensureClient } = require('../middlewares/auth');
const { insertPendingShipment, pool } = require('../dbUtils');

router.use(authMiddleware.ensureAuthenticated);

router.get('/send-package', ensureAuthenticated, ensureClient, (req, res) => {
  res.render('send-package.ejs', { user: req.session.user, errors: null, formData: {} });
});

const { body, validationResult } = require('express-validator');

router.post('/send-package',
  ensureAuthenticated,
  ensureClient,
  [
    // validation rules ...
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    if (!errors.isEmpty()) {
      return res.render('send-package', { errors: errors.array(), formData });
    }

    try {
      // Get sender id from username
      const senderUsername = req.session.user.name;

      // Use helper function to insert pending shipment
      await insertPendingShipment({
        senderUsername: senderUsername,
        recipient_first_name: formData.recipient_first_name,
        recipient_last_name: formData.recipient_last_name,
        delivery_address: formData.recipient_address,
        weight: formData.weight,
        price: formData.package_price,
        description: formData.description || null,
      });

      req.flash('success', 'Package registered successfully!');
      res.redirect('/clients/shipments');

    } catch (err) {
      console.error('Error registering package:', err);
      req.flash('error', 'Failed to register package.');
      res.render('send-package.ejs', { errors: [{ msg: 'Server error' }], formData });
    }
  }
);

router.get('/pending-shipments', ensureAuthenticated, ensureClient, async (req, res) => {
  try {
    // Get the logged-in user's ID (sender_id)
    const senderUsername = req.session.user.name;

    // Get user id from username
    const userRes = await pool.query('SELECT id FROM users WHERE username = $1', [senderUsername]);
    if (userRes.rows.length === 0) {
      req.flash('error', 'User not found.');
      return res.redirect('/');
    }
    const userId = userRes.rows[0].id;

    // Fetch pending shipments for this client
    const shipmentsRes = await pool.query(
      `SELECT id, recipient_first_name, recipient_last_name, delivery_address, weight, price, description, created_at
       FROM pending_shipments
       WHERE sender_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const shipments = shipmentsRes.rows;

    // Render the page with the shipments data
    res.render('client-pending-shipments.ejs', {
      shipments,
      errors: null,
    });

  } catch (err) {
    console.error('Error fetching client packages:', err);
    req.flash('error', 'Failed to load packages.');
    res.redirect('/');
  }
});

//router.get('/', clientController.getAllClients);
//router.get('/:id', clientController.getClientById);
//router.post('/', authMiddleware.ensureAdmin, clientController.createClient);
//router.put('/:id', authMiddleware.ensureAdmin, clientController.updateClient);
//router.delete('/:id', authMiddleware.ensureAdmin, clientController.deleteClient);

module.exports = router;
