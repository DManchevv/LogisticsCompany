// Import the staff_pool connection from dbUtils
const { staff_pool } = require('../dbUtils');

// Fetch all active offices from the database
async function getAllOffices() {
  const result = await staff_pool.query(
    'SELECT * FROM offices WHERE active = TRUE ORDER BY id'
  );
  return result.rows; // Return array of active office records
}

// Fetch a single office by its ID
async function getOfficeById(id) {
  const result = await staff_pool.query(
    'SELECT * FROM offices WHERE id = $1',
    [id] // Parameterized query for safety
  );
  return result.rows[0]; // Return the first (and only) matching row
}

// Create a new office with a name and address, marked as active by default
async function createOffice(data) {
  const { name, address } = data;

  await staff_pool.query(
    'INSERT INTO offices (name, address, active) VALUES ($1, $2, TRUE)',
    [name, address]
  );
}

// Update an existing office's name and address by ID
async function updateOffice(id, data) {
  const { name, address } = data;

  const result = await staff_pool.query(
    'UPDATE offices SET name = $1, address = $2 WHERE id = $3 RETURNING *',
    [name, address, id]
  );

  return result.rows[0];
}

// Soft-delete (deactivate) an office by setting active = FALSE
async function deactivateOffice(id) {
  await staff_pool.query(
    'UPDATE offices SET active = FALSE WHERE id = $1',
    [id]
  );
}

// Export all data access functions for use in routes/controllers
module.exports = {
  getAllOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deactivateOffice
};
