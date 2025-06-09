const { staff_pool } = require('../dbUtils');

async function getAllShipments() {
  const result = await staff_pool.query('SELECT * FROM shipments ORDER BY id DESC');
  return result.rows;
}

async function getShipmentById(id) {
  const result = await staff_pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
  return result.rows[0];
}

async function createShipment(data) {
  const {
    sender_id,
    receiver_id,
    recipient_first_name,
    recipient_last_name,
    delivery_address,
    weight,
    price,
    description,
    status
  } = data;

  // receiver_id must be provided if status is not 'pending'
  if (status !== 'pending' && !receiver_id) {
    throw new Error("receiver_id is required for non-pending shipments");
  }

  await staff_pool.query(
    `INSERT INTO shipments 
     (sender_id, receiver_id, recipient_first_name, recipient_last_name, delivery_address, weight, price, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      sender_id,
      status === 'pending' ? null : receiver_id,
      status === 'pending' ? recipient_first_name : null,
      status === 'pending' ? recipient_last_name : null,
      delivery_address,
      weight,
      price,
      description,
      status
    ]
  );
}

async function updateShipment(id, data) {
  const {
    receiver_id,
    recipient_first_name,
    recipient_last_name,
    delivery_address,
    weight,
    price,
    description,
    status,
  } = data;

  console.log("CHECK_RECEIVER_ID:", receiver_id);

  const query = `
    UPDATE shipments SET
      receiver_id = $1,
      recipient_first_name = $2,
      recipient_last_name = $3,
      delivery_address = $4,
      weight = $5,
      price = $6,
      description = $7,
      status = $8
    WHERE id = $9
    RETURNING *;
  `;

  const values = [
    receiver_id || null,
    recipient_first_name || null,
    recipient_last_name || null,
    delivery_address,
    weight,
    price,
    description || null,
    status,
    id,
  ];

  const result = await staff_pool.query(query, values);
  return result.rows[0];
}

async function deleteShipment(id) {
  await staff_pool.query('DELETE FROM shipments WHERE id = $1', [id]);
}

module.exports = {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
};
