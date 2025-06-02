const pool = require('../config/db');

exports.getRevenueReport = async (req, res) => {
  const { start_date, end_date, office_id } = req.query;
  
  try {
    let query = `
      SELECT 
        DATE(s.created_at) AS date,
        COUNT(*) AS shipment_count,
        SUM(s.price) AS total_revenue,
        SUM(CASE WHEN s.shipment_type = 'office' THEN 1 ELSE 0 END) AS office_deliveries,
        SUM(CASE WHEN s.shipment_type = 'office' THEN s.price ELSE 0 END) AS office_revenue,
        SUM(CASE WHEN s.shipment_type = 'address' THEN 1 ELSE 0 END) AS address_deliveries,
        SUM(CASE WHEN s.shipment_type = 'address' THEN s.price ELSE 0 END) AS address_revenue
      FROM shipments s
      WHERE s.created_at BETWEEN $1 AND $2
    `;
    
    const params = [start_date, end_date];
    
    if (office_id) {
      query += ' AND s.sender_office_id = $3';
      params.push(office_id);
    }
    
    query += ' GROUP BY DATE(s.created_at) ORDER BY DATE(s.created_at)';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPendingShipments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, 
        c1.full_name AS sender_name, 
        c2.full_name AS receiver_name
      FROM shipments s
      LEFT JOIN clients c1 ON s.sender_id = c1.id
      LEFT JOIN clients c2 ON s.receiver_id = c2.id
      WHERE s.status != 'delivered'`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeShipments = async (req, res) => {
  const { employee_id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT s.*, 
        c1.full_name AS sender_name, 
        c2.full_name AS receiver_name
      FROM shipments s
      LEFT JOIN clients c1 ON s.sender_id = c1.id
      LEFT JOIN clients c2 ON s.receiver_id = c2.id
      WHERE s.created_by = $1`,
      [employee_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getClientShipments = async (req, res) => {
  const { client_id, type } = req.params;
  
  try {
    let condition = '';
    if (type === 'sent') {
      condition = 'sender_id = $1';
    } else if (type === 'received') {
      condition = 'receiver_id = $1';
    }
    
    const result = await pool.query(
      `SELECT s.*, 
        c1.full_name AS sender_name, 
        c2.full_name AS receiver_name
      FROM shipments s
      LEFT JOIN clients c1 ON s.sender_id = c1.id
      LEFT JOIN clients c2 ON s.receiver_id = c2.id
      WHERE ${condition}`,
      [client_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching client shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
