const pool = require('../config/db');

exports.getAllEmployees = async (req, res) => {
  try {
    const query = `
      SELECT e.*, o.name AS office_name 
      FROM employees e
      LEFT JOIN offices o ON e.office_id = o.id
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT e.*, o.name AS office_name 
      FROM employees e
      LEFT JOIN offices o ON e.office_id = o.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createEmployee = async (req, res) => {
  const { full_name, position, office_id } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO employees (full_name, position, office_id) VALUES ($1, $2, $3) RETURNING *',
      [full_name, position, office_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { full_name, position, office_id } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE employees SET full_name = $1, position = $2, office_id = $3 WHERE id = $4 RETURNING *',
      [full_name, position, office_id, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
