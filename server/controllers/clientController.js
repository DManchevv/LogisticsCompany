const pool = require('../config/db');

exports.getAllClients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getClientById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createClient = async (req, res) => {
  const { full_name, email, phone, address } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO users (full_name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [full_name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, address } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *',
      [full_name, email, phone, address, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
