const express = require('express');
const router = express.Router();
const { staff_pool } = require('../dbUtils');

// ============================================================================
// Route: GET /clients
// Purpose: Generate clients report with optional filtering by username, name, email, active status, and creation dates
// ============================================================================

router.get('/clients', async (req, res) => {
  const { username, first_name, last_name, email, active, created_before, created_after } = req.query;

  const filters = [];
  const values = [];
  let i = 1;

  // Add filters dynamically based on query parameters
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

  // Construct WHERE clause or empty string if no filters
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  // SQL query to fetch clients with filters and order by creation date descending
  const query = `
    SELECT id, username, first_name, last_name, email, phone, address, created_at, active 
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
  `;

  try {
    // Execute the query
    const usersRes = await staff_pool.query(query, values);

    // Render clients report page
    res.render('backoffice/reports/clients.ejs', {
      users: usersRes.rows,
      filters: req.query,
      layout: 'backoffice/layout.ejs',
      errors: req.flash('errors'),
      success: req.flash('success'),	
      title: 'Clients Report',
      active: 'reports',
      currentPage: '/bo/reports/clients'
    });
  } catch (err) {
    console.error('Error loading clients report:', err);
    // Flash user-friendly error message
    req.flash('error', 'Oops! Unable to load the clients report at the moment. Please try again later.');
    res.redirect('/bo');
  }
});

// ============================================================================
// Route: GET /staff
// Purpose: Generate staff report with optional filters by name, position, office, active status, and creation dates
// ============================================================================

router.get('/staff', async (req, res) => {
  const { first_name, last_name, position, office_id, active, created_before, created_after } = req.query;

  const filters = [];
  const values = [];
  let i = 1;

  // Add filters dynamically based on query parameters
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

  // Construct WHERE clause or empty string if no filters
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  // SQL query to fetch staff with filters and order by creation date descending
  const query = `
    SELECT id, first_name, last_name, position, office_id, created_at, active
    FROM staff
    ${whereClause}
    ORDER BY created_at DESC
  `;

  try {
    // Execute the query
    const staffRes = await staff_pool.query(query, values);

    // Render staff report page
    res.render('backoffice/reports/staff.ejs', {
      staff: staffRes.rows,
      filters: req.query,
      layout: 'backoffice/layout.ejs',
      title: 'Staff Report',
      active: 'reports',
      errors: req.flash('errors'),
      success: req.flash('success'),
      currentPage: '/bo/reports/staff'
    });
  } catch (err) {
    console.error('Error loading staff report:', err);
    // Flash user-friendly error message
    req.flash('error', 'Oops! Unable to load the staff report at the moment. Please try again later.');
    res.redirect('/bo');
  }
});

// ============================================================================
// Route: GET /shipments
// ============================================================================

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

  // Add filters dynamically, converting inputs and using parameterized queries to prevent SQL injection
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

  // Construct WHERE clause or empty string if no filters
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  // SQL query to fetch shipments with left join on statuses, ordered by creation date descending
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
    // Execute shipments query
    const shipmentsRes = await staff_pool.query(query, values);

    // Fetch all shipment statuses for filter dropdown or display
    const statusesRes = await staff_pool.query('SELECT id, name FROM shipment_statuses ORDER BY id');
    const statuses = statusesRes.rows;

    // Optionally flash success message here
    // req.flash('success', 'Shipments report loaded successfully.');

    // Render shipments report page
    res.render('backoffice/reports/shipments.ejs', {
      shipments: shipmentsRes.rows,
      filters: req.query,
      statuses,
      layout: 'backoffice/layout.ejs',
      title: 'Shipments Report',
      active: 'reports',
      errors: req.flash('errors'),
      success: req.flash('success'),
      currentPage: '/bo/reports/shipments'
    });
  } catch (err) {
    console.error('Error loading shipments report:', err);
    // Flash user-friendly error message
    req.flash('error', 'Oops! Unable to load the shipments report at the moment. Please try again later.');
    res.redirect('/bo');
  }
});

// ============================================================================
// Route: GET /profit
// ============================================================================
router.get('/profit', async (req, res) => {
  const { created_after, created_before } = req.query;

  const filters = [];
  const values = [];
  let i = 1;

  // Filter only by created_at period if provided
  if (created_after) {
    filters.push(`created_at >= $${i++}`);
    values.push(created_after);
  }
  if (created_before) {
    filters.push(`created_at <= $${i++}`);
    values.push(created_before);
  }

  // Exclude CANCELLED and PENDING statuses by joining shipment_statuses table
  filters.push(`st.name NOT IN ('CANCELLED', 'PENDING')`);

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const query = `
    SELECT COALESCE(SUM(sh.price), 0) AS total_profit
    FROM shipments sh
    LEFT JOIN shipment_statuses st ON sh.status_id = st.id
    ${whereClause};
  `;

  try {
    const result = await staff_pool.query(query, values);
    const total_profit = result.rows[0].total_profit;

    res.render('backoffice/reports/profit.ejs', {
      total_profit,
      filters: req.query,
      layout: 'backoffice/layout.ejs',
      title: 'Company Profit Report',
      active: 'reports',
      errors: req.flash('errors'),
      success: req.flash('success'),
      currentPage: '/bo/reports/profit'
    });
  } catch (err) {
    console.error('Error loading profit report:', err);
    req.flash('error', 'Oops! Unable to load the profit report. Please try again later.');
    res.redirect('/bo');
  }
});

module.exports = router;

