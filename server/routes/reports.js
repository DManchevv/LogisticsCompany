const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');
const { staff_pool } = require('../dbUtils');

router.get('/revenue', reportController.getRevenueReport);
router.get('/pending-shipments', reportController.getPendingShipments);
router.get('/employee-shipments/:employee_id', reportController.getEmployeeShipments);

router.get('/client-shipments/:client_id/:type', (req, res, next) => {
  const { type } = req.params;
  
  if (type === 'sent' || type === 'received') {
    return reportController.getClientShipments(req, res, next);
  }
  
  res.status(400).json({ error: 'Invalid shipment type. Must be "sent" or "received".' });
});

router.get('/clients', async (req, res) => {
  const { username, first_name, last_name, email, active, created_before, created_after } = req.query;

  const filters = [];
  const values = [];
  let i = 1;

  if (username) {
    filters.push(`username ILIKE $${i++}`);
    values.push(`%${username}%`);
  }

  if (first_name) {
    filters.push(`first_name ILIKE $${i++}`);
    values.push(`%${first_name}%`);
  }

  if (last_name) {
    filters.push(`last_name ILIKE $${i++}`);
    values.push(`%${last_name}%`);
  }

  if (email) {
    filters.push(`email ILIKE $${i++}`);
    values.push(`%${email}%`);
  }

  if (active === 'true' || active === 'false') {
    filters.push(`active = $${i++}`);
    values.push(active === 'true');
  }

  if (created_after) {
    filters.push(`created_at >= $${i++}`);
    values.push(created_after);
  }

  if (created_before) {
    filters.push(`created_at <= $${i++}`);
    values.push(created_before);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const query = `
    SELECT id, username, first_name, last_name, email, phone, address, created_at, active 
    FROM users 
    ${whereClause}
    ORDER BY created_at DESC
  `;

  try {
    const usersRes = await staff_pool.query(query, values);
    res.render('backoffice/reports/clients.ejs', {
      users: usersRes.rows,
      filters: req.query,
      layout: 'backoffice/layout.ejs',
      title: 'Clients Report',
      active: 'reports',
			currentPage: '/bo/reports/clients'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load clients report.');
    res.redirect('/bo');
  }
});

router.get('/staff', async (req, res) => {
  const { first_name, last_name, position, office_id, active, created_before, created_after } = req.query;

  const filters = [];
  const values = [];
  let i = 1;

  if (first_name) {
    filters.push(`first_name ILIKE $${i++}`);
    values.push(`%${first_name}%`);
  }

  if (last_name) {
    filters.push(`last_name ILIKE $${i++}`);
    values.push(`%${last_name}%`);
  }

  if (position) {
    filters.push(`position = $${i++}`);
    values.push(position);
  }

  if (office_id) {
    filters.push(`office_id = $${i++}`);
    values.push(parseInt(office_id));
  }

  if (active === 'true' || active === 'false') {
    filters.push(`active = $${i++}`);
    values.push(active === 'true');
  }

  if (created_after) {
    filters.push(`created_at >= $${i++}`);
    values.push(created_after);
  }

  if (created_before) {
    filters.push(`created_at <= $${i++}`);
    values.push(created_before);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const query = `
    SELECT id, first_name, last_name, position, office_id, created_at, active
    FROM staff
    ${whereClause}
    ORDER BY created_at DESC
  `;

  try {
    const staffRes = await staff_pool.query(query, values);
    res.render('backoffice/reports/staff.ejs', {
      staff: staffRes.rows,
      filters: req.query,
      layout: 'backoffice/layout.ejs',
      title: 'Staff Report',
      active: 'reports',
      currentPage: '/bo/reports/staff'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load staff report.');
    res.redirect('/bo');
  }
});

router.get('/shipments', async (req, res) => {
  const {
    sender_id,
    receiver_id,
    recipient_first_name,
    recipient_last_name,
    status_id,
    weight_min,
    weight_max,
    price_min,
    price_max,
    created_before,
    created_after
  } = req.query;

  const filters = [];
  const values = [];
  let i = 1;

	// Build the WHERE clase using parameterized placeholders with $${i++} ($1, $2, $3...) to prevent SQL INJECTION

  if (sender_id) {
    filters.push(`sender_id = $${i++}`);
    values.push(parseInt(sender_id));
  }

  if (receiver_id) {
    filters.push(`receiver_id = $${i++}`);
    values.push(parseInt(receiver_id));
  }

  if (recipient_first_name) {
    filters.push(`recipient_first_name ILIKE $${i++}`);
    values.push(`%${recipient_first_name}%`);
  }

  if (recipient_last_name) {
    filters.push(`recipient_last_name ILIKE $${i++}`);
    values.push(`%${recipient_last_name}%`);
  }

	if (status_id) {
		filters.push(`sh.status_id = $${i++}`);
		values.push(status_id);
	}

  if (weight_min) {
    filters.push(`weight >= $${i++}`);
    values.push(parseFloat(weight_min));
  }

  if (weight_max) {
    filters.push(`weight <= $${i++}`);
    values.push(parseFloat(weight_max));
  }

  if (price_min) {
    filters.push(`price >= $${i++}`);
    values.push(parseFloat(price_min));
  }

  if (price_max) {
    filters.push(`price <= $${i++}`);
    values.push(parseFloat(price_max));
  }

  if (created_after) {
    filters.push(`created_at >= $${i++}`);
    values.push(created_after);
  }

  if (created_before) {
    filters.push(`created_at <= $${i++}`);
    values.push(created_before);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const query = `
		SELECT 
			sh.id, sender_id, receiver_id,
			recipient_first_name, recipient_last_name,
			delivery_address, weight, price, description,
			st.name AS status,
			sh.created_at
		FROM shipments sh
		LEFT JOIN shipment_statuses st ON sh.status_id = st.id
		${whereClause}
		ORDER BY sh.created_at DESC;
  `;

  try {
    const shipmentsRes = await staff_pool.query(query, values);
		const statusesRes = await staff_pool.query('SELECT id, name FROM shipment_statuses ORDER BY id');
		const statuses = statusesRes.rows;

		console.log("CHECK_STATUSES:", shipmentsRes.rows);

    res.render('backoffice/reports/shipments.ejs', {
      shipments: shipmentsRes.rows,
      filters: req.query,
			statuses,
      layout: 'backoffice/layout.ejs',
      title: 'Shipments Report',
      active: 'reports',
      currentPage: '/bo/reports/shipments'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load shipments report.');
    res.redirect('/bo');
  }
});

module.exports = router;
