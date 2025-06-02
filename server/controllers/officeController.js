const pool = require('../config/db');

exports.getAllOffices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offices');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching offices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOfficeById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM offices WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Office not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching office:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createOffice = async (req, res) => {
  const { name, address, phone, manager_id } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO offices (name, address, phone, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, address, phone, manager_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating office:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateOffice = async (req, res) => {
  const { id } = req.params;
  const { name, address, phone, manager_id } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE offices SET name = $1, address = $2, phone = $3, manager_id = $4 WHERE id = $5 RETURNING *',
      [name, address, phone, manager_id, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Office not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating office:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteOffice = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM offices WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Office not found' });
    }
    
    res.json({ message: 'Office deleted successfully' });
  } catch (error) {
    console.error('Error deleting office:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
