const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureClient } = require('../middlewares/auth');
const { pool } = require('../dbUtils');
const { body, validationResult } = require('express-validator');

// Middleware
router.use(ensureAuthenticated);

// Show send package form
router.get('/send-package', ensureClient, (req, res) => {
  res.render('send-package.ejs', {
    user: req.session.user.name,
    errors: [],
    formData: {},
    title: 'Register Package'
  });
});

router.post(
  '/send-package',
  ensureClient,
  [
    body('recipient_first_name').notEmpty().withMessage('Recipient first name is required.'),
    body('recipient_last_name').notEmpty().withMessage('Recipient last name is required.'),
    body('recipient_address').notEmpty().withMessage('Delivery address is required.'),
    body('weight').isFloat({ min: 0.1 }).withMessage('Weight must be at least 0.1 kg.'),
    body('package_price').isFloat({ min: 0.01 }).withMessage('Price must be positive.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    if (!errors.isEmpty()) {
      return res.render('send-package.ejs', {
        user: req.session.user.name,
        errors: errors.array(),
        formData,
        title: 'Register Package'
      });
    }

    try {
      // Get sender_id from username
      const { name: username } = req.session.user;
      const senderRes = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

      if (senderRes.rowCount === 0) {
        req.flash('error', 'User not found.');
        return res.redirect('/');
      }

      const sender_id = senderRes.rows[0].id;

      // Get status_id for "pending"
      const statusRes = await pool.query("SELECT id FROM shipment_statuses WHERE name = 'pending' LIMIT 1");
      if (statusRes.rowCount === 0) {
        throw new Error("Shipment status 'pending' not found.");
      }
      const pendingStatusId = statusRes.rows[0].id;

      // Insert into shipments using status_id
      await pool.query(`
        INSERT INTO shipments (
          sender_id,
          recipient_first_name,
          recipient_last_name,
          delivery_address,
          weight,
          price,
          description,
          status_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        sender_id,
        formData.recipient_first_name,
        formData.recipient_last_name,
        formData.recipient_address,
        formData.weight,
        formData.package_price,
        formData.description || null,
        pendingStatusId
      ]);

      req.flash('success', 'Package registered successfully!');
      res.redirect('/clients/pending-shipments');

    } catch (err) {
			console.error('Error inserting shipment:', err);
			req.flash('error', 'Failed to register package.');
			res.render('send-package.ejs', {
				user: req.session.user.name,
				errors: [{ msg: 'Server error' }],
				formData,
				title: 'Register Package'
			});
		}
	}
);

// List pending shipments for logged-in client
router.get('/pending-shipments', ensureClient, async (req, res) => {
  try {
    const username = req.session.user.name;
    const userRes = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

    if (userRes.rowCount === 0) {
      req.flash('error', 'User not found.');
      return res.redirect('/');
    }

    const sender_id = userRes.rows[0].id;

    const shipmentsRes = await pool.query(`
      SELECT id, recipient_first_name, recipient_last_name, delivery_address, weight, price, description, created_at
      FROM shipments
      WHERE sender_id = $1 AND status_id = 1
      ORDER BY created_at DESC
    `, [sender_id]);

    res.render('client-pending-shipments.ejs', {
      shipments: shipmentsRes.rows,
      title: 'Pending Shipments'
    });

  } catch (err) {
    console.error('Error fetching shipments:', err);
    req.flash('error', 'Failed to load shipments.');
    res.redirect('/');
  }
});

router.get('/received-shipments', async (req, res) => {
  try {
    const username = req.session.user.name;

    const rows = await pool.query(`
      SELECT s.id,
							s.weight,
							s.price,
							s.description,
							s.delivery_address,
							s.created_at,
              u.first_name AS recipient_first_name,
							u.last_name AS recipient_last_name
       FROM shipments s
       JOIN users u ON s.sender_id = u.id
       WHERE u.username = $1
				 AND s.status_id = 2 OR s.status_id = 3`, [username]);

    res.render('client-received-shipments.ejs', {
      shipments: rows.rows,
      currentPage: '/clients/received-shipments',
      user: req.session.user.name,
			title: 'Register Shipment'
    });
  } catch (err) {
    console.error(err);
		res.render('client-received-shipments.ejs', {
			shipments: [],
			errors: [{ msg: 'Server error' }],
			user: req.session.user.name,
			title: 'Register Shipment'
		});
  }
});

module.exports = router;
