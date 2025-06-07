const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const staff_pool = new Pool({
  user: process.env.DB_STAFF_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_STAFF_PASSWORD,
  port: process.env.DB_PORT,
});

async function insertPendingShipment({
  senderUsername,
  recipient_first_name,
  recipient_last_name,
  delivery_address,
  weight,
  price,
  description,
}) {
  // 1. Get sender_id from username
  const senderRes = await pool.query(`
		SELECT id
		FROM users
		WHERE username = $1`,
    [senderUsername]
  );

  if (senderRes.rows.length === 0) {
    throw new Error('Sender not found');
  }

  const sender_id = senderRes.rows[0].id;

  // 2. Insert into pending_shipments
  const insertQuery = `
    INSERT INTO pending_shipments
      (sender_id, recipient_first_name, recipient_last_name, delivery_address, weight, price, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;

  const values = [
    sender_id,
    recipient_first_name,
    recipient_last_name,
    delivery_address,
    weight,
    price,
    description
  ];

  const result = await pool.query(insertQuery, values);
  return result.rows[0].id;
}

exports.pool = pool;
exports.staff_pool = staff_pool;
exports.insertPendingShipment = insertPendingShipment;
