const { staff_pool } = require('../dbUtils');

async function getAllShipments() {
  const result = await staff_pool.query(`
    SELECT 
      s.*,
      u.username AS sender_username,
      stat.name AS status,
      ose.name AS sender_office_name,
      ore.name AS receiver_office_name,

      CASE 
        WHEN s.receiver_id IS NOT NULL THEN ru.username
        WHEN s.receiver_id IS NULL AND stat.name = 'registered' THEN ralt.username
        ELSE NULL
      END AS receiver_username

    FROM shipments s
    LEFT JOIN offices ose ON s.sender_office_id = ose.id
    LEFT JOIN offices ore ON s.receiver_office_id = ore.id
    JOIN users u ON s.sender_id = u.id
    LEFT JOIN shipment_statuses stat ON s.status_id = stat.id

    LEFT JOIN users ru ON s.receiver_id = ru.id

    LEFT JOIN users ralt ON s.receiver_id IS NULL AND stat.name = 'registered' AND ralt.id = s.receiver_id

    ORDER BY s.id DESC
  `);

  return result.rows;
}

async function getShipmentById(id) {
  const result = await staff_pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
  return result.rows[0];
}

async function createShipment(data) {
  const {
    sender_id,
		receiver_office_id,
		sender_office_id,
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
     (sender_id, receiver_office_id, sender_office_id, receiver_id, recipient_first_name, recipient_last_name, delivery_address, weight, price, description, status_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      sender_id,
			receiver_office_id,
			sender_office_id,
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
		receiver_office_id,
		sender_office_id,
    delivery_address,
    weight,
    price,
    description,
    status_id,
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
      status_id = $8,
			receiver_office_id = $9,
			sender_office_id = $10
    WHERE id = $11
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
    status_id,
		receiver_office_id,
		sender_office_id,
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
