const pool = require('../config/db');

exports.getAllShipments = async (req, res) => {
  try {
    // Различни заявки според ролята
    let query = `
      SELECT s.*, 
        c1.full_name AS sender_name, 
        c2.full_name AS receiver_name,
        o1.name AS sender_office_name,
        o2.name AS receiver_office_name
      FROM shipments s
      LEFT JOIN clients c1 ON s.sender_id = c1.id
      LEFT JOIN clients c2 ON s.receiver_id = c2.id
      LEFT JOIN offices o1 ON s.sender_office_id = o1.id
      LEFT JOIN offices o2 ON s.receiver_office_id = o2.id
    `;
    
    if (req.user.role === 'client') {
      query += ` WHERE s.sender_id = (SELECT id FROM clients WHERE user_id = $1) 
                 OR s.receiver_id = (SELECT id FROM clients WHERE user_id = $1)`;
      const result = await pool.query(query, [req.user.id]);
      return res.json(result.rows);
    }
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createShipment = async (req, res) => {
  const {
    sender_id,
    receiver_id,
    sender_office_id,
    shipment_type,
    weight,
    delivery_address,
    receiver_office_id
  } = req.body;

  // Изчисляване на цена
  const basePrice = 5;
  const perKgPrice = shipment_type === 'office' ? 0.8 : 1.2;
  const price = basePrice + (weight * perKgPrice);

  try {
    const result = await pool.query(
      `INSERT INTO shipments (
        sender_id, 
        receiver_id, 
        sender_office_id, 
        receiver_office_id,
        delivery_address,
        weight, 
        price, 
        shipment_type,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        sender_id,
        receiver_id,
        sender_office_id,
        shipment_type === 'office' ? receiver_office_id : null,
        shipment_type === 'address' ? delivery_address : null,
        weight,
        price,
        shipment_type,
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    let query = 'UPDATE shipments SET status = $1';
    const values = [status, id];
    
    if (status === 'delivered') {
      query += ', delivered_at = CURRENT_TIMESTAMP';
    }
    
    query += ' WHERE id = $2 RETURNING *';
    
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getShipmentById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT s.*, 
        c1.full_name AS sender_name, c1.email AS sender_email, c1.phone AS sender_phone,
        c2.full_name AS receiver_name, c2.email AS receiver_email, c2.phone AS receiver_phone,
        o1.name AS sender_office_name, o1.address AS sender_office_address,
        o2.name AS receiver_office_name, o2.address AS receiver_office_address,
        e.full_name AS created_by_name
      FROM shipments s
      LEFT JOIN clients c1 ON s.sender_id = c1.id
      LEFT JOIN clients c2 ON s.receiver_id = c2.id
      LEFT JOIN offices o1 ON s.sender_office_id = o1.id
      LEFT JOIN offices o2 ON s.receiver_office_id = o2.id
      LEFT JOIN employees e ON s.created_by = e.id
      WHERE s.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
